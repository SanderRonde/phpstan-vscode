import type { WatcherNotificationFileData } from '../../../../shared/notificationChannels';
import { basicHash, createPromise, withTimeout } from '../../../../shared/util';
import { checkPrefix, log, MANAGER_PREFIX, WATCHER_PREFIX } from '../log';
import { OperationStatus } from '../../../../shared/statusBar';
import { CHECK_DEBOUNCE } from '../../../../shared/constants';
import type { PromiseObject } from '../../../../shared/util';
import type { AsyncDisposable, ClassConfig } from '../types';
import type { DocumentManager } from '../documentManager';
import { getEditorConfiguration } from '../editorConfig';
import type { Disposable } from 'vscode-languageserver';
import type { ConfigResolver } from '../configResolver';
import { debug, sanitizeFilePath } from '../debug';
import type { ReportedErrors } from './check';
import { executeCommand } from '../commands';
import { showError } from '../errorUtil';
import { ReturnResult } from '../result';
import { PHPStanCheck } from './check';
import { URI } from 'vscode-uri';

interface CheckOperation {
	check: PHPStanCheck;
	hashes: Record<string, string>;
}
type RecursivePromiseObject =
	| PromiseObject<RecursivePromiseObject>
	| OperationStatus;

const PROJECT_CHECK_STR = '__project__';
export class PHPStanCheckManager implements AsyncDisposable {
	private _operations: Map<string, CheckOperation> = new Map();
	private _filePromises: Map<string, RecursivePromiseObject> = new Map();
	private readonly _queuedCalls: Map<
		string,
		{
			promiseResolvers: ((value: unknown) => void)[];
			timeout: NodeJS.Timeout;
		}
	> = new Map();
	private readonly _disposables: Disposable[] = [];
	private _operationCount = 0;

	public constructor(
		private readonly _classConfig: ClassConfig,
		private readonly _configResolver: ConfigResolver,
		private readonly _getDocumentManager: () => DocumentManager
	) {}

	public get operationCount(): number {
		return this._operationCount;
	}

	public debounceWithKey<V>(
		identifier: string,
		callback: () => V | Promise<V>
	): Promise<V> {
		const existing = this._queuedCalls.get(identifier);
		if (existing) {
			clearTimeout(existing.timeout);
		}
		return new Promise<V>((resolve) => {
			this._queuedCalls.set(identifier, {
				promiseResolvers: [
					...(existing?.promiseResolvers ?? []),
					resolve,
				] as ((value: unknown) => void)[],
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				timeout: setTimeout(async () => {
					const promiseResolvers =
						this._queuedCalls.get(identifier)!.promiseResolvers;
					this._queuedCalls.delete(identifier);
					const result = await callback();
					promiseResolvers.forEach((resolve) => resolve(result));
				}, CHECK_DEBOUNCE),
			});
		});
	}

	private async _onTimeout(
		check: PHPStanCheck,
		onError: null | ((error: string) => void)
	): Promise<void> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		if (!editorConfig.suppressTimeoutMessage) {
			let error = `PHPStan check timed out after ${editorConfig.projectTimeout / 1000}s`;
			if (!editorConfig.singleFileMode) {
				error +=
					". Consider bumping the timeout or switching to single-file check mode if your device can't handle full-project checks.";
			}
			showError(this._classConfig.connection, error, [
				{
					title: 'Adjust timeout',
					callback: () => {
						void executeCommand(
							this._classConfig.connection,
							'workbench.action.openSettings',
							'phpstan.projectCheckTimeout'
						);
					},
				},
				...(!editorConfig.singleFileMode
					? [
							{
								title: 'Enable single-file check mode',
								callback: () => {
									void executeCommand(
										this._classConfig.connection,
										'workbench.action.openSettings',
										'phpstan.singleFileMode'
									);
								},
							},
						]
					: []),
				{
					title: 'Stop showing this message',
					callback: () => {
						void executeCommand(
							this._classConfig.connection,
							'workbench.action.openSettings',
							'phpstan.suppressTimeoutMessage'
						);
					},
				},
			]);
		}

		log(
			checkPrefix(check),
			`PHPStan check timed out after ${editorConfig.projectTimeout}ms`
		);
		if (onError) {
			onError(
				`PHPStan check timed out after ${editorConfig.projectTimeout}ms`
			);
		}
	}

	private _toErrorMessageMap(result: ReturnResult<ReportedErrors>): {
		fileSpecificErrors: Record<string, string[]>;
		notFileSpecificErrors: string[];
	} {
		if (result.success()) {
			const fileSpecificErrors: Record<string, string[]> = {};
			for (const uri in result.value.fileSpecificErrors) {
				fileSpecificErrors[uri] = result.value.fileSpecificErrors[
					uri
				].map((err) => err.message);
			}
			return {
				fileSpecificErrors,
				notFileSpecificErrors: result.value.notFileSpecificErrors,
			};
		}
		return {
			fileSpecificErrors: {},
			notFileSpecificErrors: [],
		};
	}

	private async _getFilePromise(uri: string): Promise<OperationStatus> {
		if (!this._filePromises.has(uri)) {
			return Promise.resolve(OperationStatus.ERROR);
		}
		let obj: RecursivePromiseObject = this._filePromises.get(uri)!;
		while (typeof obj === 'object') {
			obj = await obj.promise;
		}
		return obj;
	}

	private async _withRecursivePromise(
		uri: string,
		operation: Promise<OperationStatus>
	): Promise<void> {
		const promise = await createPromise<RecursivePromiseObject>();
		const prevPromise = this._filePromises.get(uri);
		if (typeof prevPromise === 'object') {
			prevPromise.resolve(promise);
		}
		this._filePromises.set(uri, promise);

		void operation.then((status) => {
			promise.resolve(status);
		});
	}

	private async _performProjectCheck(
		currentFile: URI | null,
		onError: null | ((error: string) => void)
	): Promise<OperationStatus> {
		// Prep check
		const check = new PHPStanCheck(this._classConfig, this._configResolver);
		log(checkPrefix(check), 'Check started for project');

		const hashes: Record<string, string> = {};
		const allContents = this._getDocumentManager().getAll();

		for (const uri in allContents) {
			const content = allContents[uri];
			hashes[uri] = basicHash(content);
		}
		this._operationCount++;
		this._operations.set(PROJECT_CHECK_STR, {
			check,
			hashes,
		});

		// Create statusbar operation
		const operation = this._classConfig.statusBar.createOperation();
		await operation.start('Checking project');

		check.onProgress((progress) => {
			void operation.progress(
				progress,
				`Checking project - ${progress.done}/${progress.total} (${progress.percentage}%)`
			);
		});

		// Do check
		const editorConfig = await getEditorConfiguration(this._classConfig);
		const runningCheck = withTimeout<
			ReturnResult<ReportedErrors>,
			Promise<ReturnResult<ReportedErrors>>
		>({
			promise: check.check(true, onError, currentFile),
			timeout: editorConfig.projectTimeout,
			onTimeout: async () => {
				await check.dispose();
				void this._onTimeout(check, onError);
				await operation.finish(OperationStatus.KILLED);

				return ReturnResult.killed();
			},
		});
		check.disposables.push(runningCheck);
		this._disposables.push(runningCheck);
		const result = await runningCheck.promise;

		// Show result of operation in statusbar
		await operation.finish(result.status);

		log(
			checkPrefix(check),
			'Check completed for project, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);

		return result.status;
	}

	private async _performFileCheck(
		file: WatcherNotificationFileData,
		onError: null | ((error: string) => void)
	): Promise<OperationStatus> {
		// Prep check
		const check = new PHPStanCheck(this._classConfig, this._configResolver);
		log(checkPrefix(check), `Check started for file: ${file.uri}`);
		debug(this._classConfig.connection, 'performFileCheck', {
			fileURI: sanitizeFilePath(file.uri),
		});

		this._operationCount++;
		this._operations.set(file.uri, {
			check,
			hashes: {
				[file.uri]: basicHash(file.content),
			},
		});

		// Create statusbar operation
		const operation = this._classConfig.statusBar.createOperation();
		await operation.start('Checking');

		// Do check
		const editorConfig = await getEditorConfiguration(this._classConfig);
		const runningCheck = withTimeout<
			ReturnResult<ReportedErrors>,
			Promise<ReturnResult<ReportedErrors>>
		>({
			promise: check.check(true, onError, URI.parse(file.uri), file),
			timeout: editorConfig.timeout,
			onTimeout: async () => {
				await check.dispose();
				void this._onTimeout(check, onError);
				await operation.finish(OperationStatus.KILLED);

				return ReturnResult.killed();
			},
		});
		debug(this._classConfig.connection, 'checkManager', {
			status: 'started',
		});
		check.disposables.push(runningCheck);
		this._disposables.push(runningCheck);
		const result = await runningCheck.promise;
		debug(this._classConfig.connection, 'checkManager', {
			status: 'finished',
		});

		// Show result of operation in statusbar
		await operation.finish(result.status);

		log(
			checkPrefix(check),
			'Check completed for file, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);

		return result.status;
	}

	private async _checkProject(
		currentFile: URI | null,
		onError: null | ((error: string) => void)
	): Promise<OperationStatus> {
		debug(this._classConfig.connection, 'checkProject', {});
		// Kill all current running instances
		if (this._operations) {
			await Promise.all(
				[...this._operations.values()].map((operation) =>
					operation.check.dispose()
				)
			);
			this._operations.clear();
		}

		const invalidFile = this._getDocumentManager().getInvalidFile();
		if (invalidFile) {
			log(
				MANAGER_PREFIX,
				`Not checking project because of invalid PHP file: ${invalidFile}`
			);
			if (onError) {
				onError(`Invalid PHP file: ${invalidFile}`);
			}
			return OperationStatus.ERROR;
		}

		await this._withRecursivePromise(
			PROJECT_CHECK_STR,
			this._performProjectCheck(currentFile, onError)
		);
		return this._getFilePromise(PROJECT_CHECK_STR);
	}

	public async _checkFile(
		file: WatcherNotificationFileData,
		onError: null | ((error: string) => void)
	): Promise<OperationStatus> {
		debug(this._classConfig.connection, 'checkFile', {
			fileURI: sanitizeFilePath(file.uri),
			contentHash: basicHash(file.content),
		});
		// Kill current running instances for this file
		if (this._operations?.get(file.uri)) {
			debug(this._classConfig.connection, 'hasRunningOperations', {
				count: this._operations.size,
			});
			const currentOperationForFile = this._operations.get(file.uri)!;
			if (
				currentOperationForFile.hashes[file.uri] ===
				basicHash(file.content)
			) {
				debug(this._classConfig.connection, 'fileIsSame', {
					fileURI: sanitizeFilePath(file.uri),
					contentHash: basicHash(file.content),
				});
				// File is the same, wait for the current check
				return this._getFilePromise(file.uri);
			}

			// Different content, kill previous check and start new one
			debug(this._classConfig.connection, 'fileIsDifferent', {
				fileURI: sanitizeFilePath(file.uri),
				contentHash: basicHash(file.content),
			});
			await currentOperationForFile.check.dispose();
			this._operations.delete(file.uri);
		}

		await this._withRecursivePromise(
			file.uri,
			this._performFileCheck(file, onError)
		);
		return this._getFilePromise(file.uri);
	}

	private async _checkProjectIfFileChanged(
		file: WatcherNotificationFileData,
		currentFile: URI | null,
		onError: null | ((error: string) => void)
	): Promise<OperationStatus> {
		const projectCheck = this._operations.get(PROJECT_CHECK_STR);
		if (!projectCheck) {
			return this._checkProject(currentFile, onError);
		}
		if (!file.content) {
			// Already checked if part of any operation
			return OperationStatus.CANCELLED;
		}
		if (
			!projectCheck.hashes[file.uri] ||
			projectCheck.hashes[file.uri] === basicHash(file.content)
		) {
			log(MANAGER_PREFIX, 'No file changes, not checking');
			return OperationStatus.CANCELLED;
		}
		return this._checkProject(currentFile, onError);
	}

	public async check(
		file: WatcherNotificationFileData | undefined,
		currentFile: URI | null,
		cause: string,
		onError: null | ((error: string) => void)
	): Promise<OperationStatus> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		const shouldCheckProject = !editorConfig.singleFileMode || !file;
		log(WATCHER_PREFIX, `Checking: ${cause}`);
		if (shouldCheckProject) {
			return this._checkProject(currentFile, onError);
		}
		return this._checkFile(file, onError);
	}

	public async checkWithDebounce(
		file: WatcherNotificationFileData | undefined,
		currentFile: URI | null,
		cause: string,
		onError: null | ((error: string) => void)
	): Promise<void> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		const shouldCheckProject = !editorConfig.singleFileMode || !file;
		return this.debounceWithKey(
			shouldCheckProject ? PROJECT_CHECK_STR : file.uri,
			async () => {
				await this.check(file, currentFile, cause, onError);
			}
		);
	}

	public async checkIfChanged(
		file: WatcherNotificationFileData,
		cause: string
	): Promise<void> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		return this.debounceWithKey(
			editorConfig.singleFileMode ? file.uri : PROJECT_CHECK_STR,
			async () => {
				log(WATCHER_PREFIX, `Checking: ${cause}`);
				if (!editorConfig.singleFileMode) {
					await this._checkProjectIfFileChanged(
						file,
						URI.parse(file.uri),
						null
					);
				} else {
					await this._checkFile(file, null);
				}
			}
		);
	}

	public clearCheckIfChangedCache(): void {
		const projectCheck = this._operations.get(PROJECT_CHECK_STR);
		if (projectCheck) {
			projectCheck.hashes = {};
		}
	}

	public async clear(): Promise<void> {
		await this.dispose();
		this._classConfig.hooks.provider.clearReport();
	}

	public async dispose(): Promise<void> {
		await Promise.all([
			...this._disposables.map((disposable) => disposable.dispose()),
		]);
		this._operations.clear();
	}
}
