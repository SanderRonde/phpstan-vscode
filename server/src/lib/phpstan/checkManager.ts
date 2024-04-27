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
import type { ReportedErrors } from './check';
import { executeCommand } from '../commands';
import { showError } from '../errorUtil';
import { ReturnResult } from '../result';
import { PHPStanCheck } from './check';

interface CheckOperation {
	check: PHPStanCheck;
	hashes: Record<string, string>;
}
type RecursivePromiseObject = PromiseObject<RecursivePromiseObject> | null;

const PROJECT_CHECK_STR = '__project__';
export class PHPStanCheckManager implements AsyncDisposable {
	private _operations: Map<string, CheckOperation> = new Map();
	private _filePromises: Map<string, RecursivePromiseObject> = new Map();
	private readonly _queuedCalls: Map<
		string,
		{
			promiseResolvers: (() => void)[];
			timeout: NodeJS.Timeout;
		}
	> = new Map();
	private readonly _disposables: Disposable[] = [];

	public constructor(
		private readonly _classConfig: ClassConfig,
		private readonly _getDocumentManager: () => DocumentManager
	) {}

	private _debounceWithKey(
		identifier: string,
		callback: () => void | Promise<void>
	): Promise<void> {
		const existing = this._queuedCalls.get(identifier);
		if (existing) {
			clearTimeout(existing.timeout);
		}
		return new Promise<void>((resolve) => {
			this._queuedCalls.set(identifier, {
				promiseResolvers: [
					...(existing?.promiseResolvers ?? []),
					resolve,
				],
				timeout: setTimeout(() => {
					this._queuedCalls.delete(identifier);
					void callback();
				}, CHECK_DEBOUNCE),
			});
		});
	}

	private async _onTimeout(check: PHPStanCheck): Promise<void> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		if (!editorConfig.suppressTimeoutMessage) {
			let error = `PHPStan check timed out after ${editorConfig.projectTimeout}ms`;
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
		void log(
			this._classConfig.connection,
			checkPrefix(check),
			`PHPStan check timed out after ${editorConfig.projectTimeout}ms`
		);
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

	private async _getFilePromise(uri: string): Promise<void> {
		if (!this._filePromises.has(uri)) {
			return Promise.resolve();
		}
		let obj: RecursivePromiseObject = this._filePromises.get(uri)!;
		do {
			obj = await obj.promise;
		} while (obj !== null);
	}

	private async _withRecursivePromise(
		uri: string,
		operation: Promise<void>
	): Promise<void> {
		const promise = await createPromise<RecursivePromiseObject>();
		const prevPromise = this._filePromises.get(uri);
		if (prevPromise) {
			prevPromise.resolve(promise);
		}
		this._filePromises.set(uri, promise);

		void operation.then(() => {
			promise.resolve(null);
		});
	}

	private async _performProjectCheck(): Promise<void> {
		// Prep check
		const check = new PHPStanCheck(this._classConfig);
		void log(
			this._classConfig.connection,
			checkPrefix(check),
			'Check started for project'
		);

		const hashes: Record<string, string> = {};
		const allContents = this._getDocumentManager().getAll();

		for (const uri in allContents) {
			const content = allContents[uri];
			hashes[uri] = basicHash(content);
		}
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
			promise: check.check(true),
			timeout: editorConfig.projectTimeout,
			onTimeout: async () => {
				await check.dispose();
				void this._onTimeout(check);
				await operation.finish(OperationStatus.KILLED);

				return ReturnResult.killed();
			},
		});
		this._disposables.push(runningCheck);
		const result = await runningCheck.promise;

		// Show result of operation in statusbar
		await operation.finish(result.status);

		void log(
			this._classConfig.connection,
			checkPrefix(check),
			'Check completed for project, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
	}

	private async _performFileCheck(
		file: WatcherNotificationFileData
	): Promise<void> {
		// Prep check
		const check = new PHPStanCheck(this._classConfig);
		void log(
			this._classConfig.connection,
			checkPrefix(check),
			`Check started for file: ${file.uri}`
		);

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
			promise: check.check(true, file),
			timeout: editorConfig.timeout,
			onTimeout: async () => {
				await check.dispose();
				void this._onTimeout(check);
				await operation.finish(OperationStatus.KILLED);

				return ReturnResult.killed();
			},
		});
		this._disposables.push(runningCheck);
		const result = await runningCheck.promise;

		// Show result of operation in statusbar
		await operation.finish(result.status);

		void log(
			this._classConfig.connection,
			checkPrefix(check),
			'Check completed for file, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
	}

	private async _checkProject(): Promise<void> {
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
			void log(
				this._classConfig.connection,
				MANAGER_PREFIX,
				`Not checking project because of invalid PHP file: ${invalidFile}`
			);
			return;
		}

		await this._withRecursivePromise(
			PROJECT_CHECK_STR,
			this._performProjectCheck()
		);
		return this._getFilePromise(PROJECT_CHECK_STR);
	}

	public async _checkFile(file: WatcherNotificationFileData): Promise<void> {
		// Kill current running instances for this file
		if (this._operations?.get(file.uri)) {
			const currentOperationForFile = this._operations.get(file.uri)!;
			if (
				currentOperationForFile.hashes[file.uri] ===
				basicHash(file.content)
			) {
				// File is the same, wait for the current check
				return this._getFilePromise(file.uri);
			}

			// Different content, kill previous check and start new one
			await currentOperationForFile.check.dispose();
			this._operations.delete(file.uri);
		}

		await this._withRecursivePromise(
			file.uri,
			this._performFileCheck(file)
		);
		return this._getFilePromise(file.uri);
	}

	private async _checkProjectIfFileChanged(
		file: WatcherNotificationFileData
	): Promise<void> {
		const projectCheck = this._operations.get(PROJECT_CHECK_STR);
		if (!projectCheck) {
			return this._checkProject();
		}
		if (!file.content) {
			// Already checked if part of any operation
			return;
		}
		if (
			!projectCheck.hashes[file.uri] ||
			projectCheck.hashes[file.uri] === basicHash(file.content)
		) {
			await log(
				this._classConfig.connection,
				MANAGER_PREFIX,
				'No file changes, not checking'
			);
			return;
		}
		return this._checkProject();
	}

	public async check(
		file: WatcherNotificationFileData | undefined,
		cause: string
	): Promise<void> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		const shouldCheckProject = !editorConfig.singleFileMode || !file;
		return this._debounceWithKey(
			shouldCheckProject ? PROJECT_CHECK_STR : file.uri,
			async () => {
				await log(
					this._classConfig.connection,
					WATCHER_PREFIX,
					`Checking: ${cause}`
				);
				if (shouldCheckProject) {
					return this._checkProject();
				}
				return this._checkFile(file);
			}
		);
	}

	public async checkIfChanged(
		file: WatcherNotificationFileData,
		cause: string
	): Promise<void> {
		const editorConfig = await getEditorConfiguration(this._classConfig);
		return this._debounceWithKey(
			editorConfig.singleFileMode ? file.uri : PROJECT_CHECK_STR,
			async () => {
				await log(
					this._classConfig.connection,
					WATCHER_PREFIX,
					`Checking: ${cause}`
				);
				if (!editorConfig.singleFileMode) {
					return this._checkProjectIfFileChanged(file);
				}
				return this._checkFile(file);
			}
		);
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
