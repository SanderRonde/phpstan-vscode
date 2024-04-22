import type { WatcherNotificationFileData } from '../../../../shared/notificationChannels';
import { basicHash, createPromise, withTimeout } from '../../../../shared/util';
import type { PHPStanVersion, WorkspaceFolders } from '../../server';
import type { ProviderCheckHooks } from '../../providers/shared';
import { OperationStatus } from '../../../../shared/statusBar';
import type { PromiseObject } from '../../../../shared/util';
import type { DocumentManager } from '../documentManager';
import { checkPrefix, log, MANAGER_PREFIX } from '../log';
import type { _Connection } from 'vscode-languageserver';
import type { Disposable } from 'vscode-languageserver';
import type { ReportedErrors } from './outputParser';
import type { PromisedValue } from '../../server';
import type { StatusBar } from '../statusBar';
import type { ProcessSpawner } from '../proc';
import { executeCommand } from '../commands';
import { getConfiguration } from '../config';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { PHPStanCheck } from './check';

export interface ClassConfig {
	statusBar: StatusBar;
	connection: _Connection;
	workspaceFolders: PromisedValue<WorkspaceFolders | null>;
	documents: DocumentManager;
	hooks: {
		provider: ProviderCheckHooks;
	};
	procSpawner: ProcessSpawner;
	version: PromisedValue<PHPStanVersion | null>;
}

interface CheckOperation {
	check: PHPStanCheck;
	hashes: Record<string, string>;
}
type RecursivePromiseObject = PromiseObject<RecursivePromiseObject> | null;

const PROJECT_CHECK_STR = '__project__';
export class PHPStanCheckManager implements Disposable {
	private _operations: Map<string, CheckOperation> = new Map();
	private _filePromises: Map<string, RecursivePromiseObject> = new Map();
	private readonly _disposables: Disposable[] = [];

	public constructor(private readonly _config: ClassConfig) {}

	private async _onTimeout(check: PHPStanCheck): Promise<void> {
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		if (!config.suppressTimeoutMessage) {
			showError(
				this._config.connection,
				`PHPStan check timed out after ${config.projectTimeout}ms`,
				[
					{
						title: 'Adjust timeout',
						callback: () => {
							void executeCommand(
								this._config.connection,
								'workbench.action.openSettings',
								'phpstan.projectCheckTimeout'
							);
						},
					},
					{
						title: 'Stop showing this message',
						callback: () => {
							void executeCommand(
								this._config.connection,
								'workbench.action.openSettings',
								'phpstan.suppressTimeoutMessage'
							);
						},
					},
				]
			);
		}
		void log(
			this._config.connection,
			checkPrefix(check),
			`PHPStan check timed out after ${config.projectTimeout}ms`
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
		const check = new PHPStanCheck(this._config);
		void log(
			this._config.connection,
			checkPrefix(check),
			'Check started for project'
		);

		const hashes: Record<string, string> = {};
		const allContents = this._config.documents.getAll();

		for (const uri in allContents) {
			const content = allContents[uri];
			hashes[uri] = basicHash(content);
		}
		this._operations.set(PROJECT_CHECK_STR, {
			check,
			hashes,
		});

		// Create statusbar operation
		const operation = this._config.statusBar.createOperation();
		await operation.start('Checking project');

		check.onProgress((progress) => {
			void operation.progress(
				progress,
				`Checking project - ${progress.done}/${progress.total} (${progress.percentage}%)`
			);
		});

		// Do check
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		const runningCheck = withTimeout<
			ReturnResult<ReportedErrors>,
			Promise<ReturnResult<ReportedErrors>>
		>({
			promise: check.check(true),
			timeout: config.projectTimeout,
			onTimeout: async () => {
				check.dispose();
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
			this._config.connection,
			checkPrefix(check),
			'Check completed for project, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
	}

	private async _performFileCheck(
		file: WatcherNotificationFileData
	): Promise<void> {
		// Prep check
		const check = new PHPStanCheck(this._config);
		void log(
			this._config.connection,
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
		const operation = this._config.statusBar.createOperation();
		await operation.start('Checking');

		// Do check
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		const runningCheck = withTimeout<
			ReturnResult<ReportedErrors>,
			Promise<ReturnResult<ReportedErrors>>
		>({
			promise: check.check(true, file),
			timeout: config.timeout,
			onTimeout: async () => {
				check.dispose();
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
			this._config.connection,
			checkPrefix(check),
			'Check completed for file, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
	}

	private async _checkProject(): Promise<void> {
		// Kill all current running instances
		if (this._operations) {
			for (const operation of this._operations.values()) {
				operation.check.dispose();
			}
			this._operations.clear();
		}

		const invalidFile = this._config.documents.getInvalidFile();
		if (invalidFile) {
			void log(
				this._config.connection,
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
			currentOperationForFile.check.dispose();
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
				this._config.connection,
				MANAGER_PREFIX,
				'No file changes, not checking'
			);
			return;
		}
		return this._checkProject();
	}

	public async check(
		file: WatcherNotificationFileData | undefined
	): Promise<void> {
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		if (!config.singleFileMode || !file) {
			return this._checkProject();
		}
		return this._checkFile(file);
	}

	public async checkIfChanged(
		file: WatcherNotificationFileData
	): Promise<void> {
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		if (!config.singleFileMode) {
			return this._checkProjectIfFileChanged(file);
		}
		return this._checkFile(file);
	}

	public clear(): void {
		this.dispose();
		this._config.hooks.provider.clearReport();
	}

	public dispose(): void {
		for (const operation of this._operations.values()) {
			operation.check.dispose();
		}
		this._operations.clear();
	}
}
