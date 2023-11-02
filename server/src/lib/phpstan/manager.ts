import type { PHPStanError } from '../../../../shared/notificationChannels';
import type { PHPStanVersion, WorkspaceFolderGetter } from '../../server';
import { createPromise, withTimeout } from '../../../../shared/util';
import type { ProviderCheckHooks } from '../../providers/shared';
import type { PromiseObject } from '../../../../shared/util';
import type { DocumentManager } from '../documentManager';
import { checkPrefix, log, MANAGER_PREFIX } from '../log';
import type { _Connection } from 'vscode-languageserver';
import type { Disposable } from 'vscode-languageserver';
import type { PartialDocument } from './runner';
import type { StatusBar } from '../statusBar';
import { executeCommand } from '../commands';
import { getConfiguration } from '../config';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { PHPStanCheck } from './check';
import { URI } from 'vscode-uri';
import path = require('path');
import { OperationStatus } from '../../../../shared/statusBar';
import type { ProcessSpawner } from '../proc';

export interface ClassConfig {
	statusBar: StatusBar;
	connection: _Connection;
	getWorkspaceFolder: WorkspaceFolderGetter;
	documents: DocumentManager;
	hooks: {
		provider: ProviderCheckHooks;
	};
	procSpawner: ProcessSpawner;
	getVersion: () => PHPStanVersion | null;
}

interface CheckOperation {
	fileContent: string;
	check: PHPStanCheck;
	applyErrors: boolean;
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
			this._config.getWorkspaceFolder
		);
		if (!config.suppressTimeoutMessage) {
			showError(
				this._config.connection,
				`PHPStan check timed out after ${config.timeout}ms`,
				[
					{
						title: 'Adjust timeout',
						callback: async () => {
							await executeCommand(
								this._config.connection,
								'workbench.action.openSettings',
								check.checkType === 'project'
									? 'phpstan.projectCheckTimeout'
									: 'phpstan.timeout'
							);
						},
					},
					{
						title: 'Stop showing this message',
						callback: async () => {
							await executeCommand(
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
			`PHPStan check timed out after ${config.timeout}ms`
		);
	}

	private _toErrorMessageMap(
		result: ReturnResult<Record<string, PHPStanError[]>>
	): Record<string, string[]> {
		const errorMessageMap: Record<string, string[]> = {};
		if (result.success()) {
			for (const uri of Object.keys(result.value)) {
				errorMessageMap[uri] = result.value[uri].map(
					(err) => err.message
				);
			}
		}
		return errorMessageMap;
	}

	private async _checkShared(
		checkType: 'file' | 'project',
		applyErrors: boolean,
		description: string,
		descriptionShort: string,
		e?: PartialDocument
	): Promise<void> {
		// Prep check
		const check = new PHPStanCheck(this._config, checkType);
		void log(
			this._config.connection,
			checkPrefix(check),
			`Check started for ${description}`
		);
		this._operations.set(e?.uri ?? PROJECT_CHECK_STR, {
			check,
			fileContent: e?.getText() ?? '',
			applyErrors: true,
		});

		// Create statusbar operation
		const operation = this._config.statusBar.createOperation();
		await operation.start(`Checking ${descriptionShort}`);

		check.onProgress((progress) => {
			void operation.progress(
				progress,
				`Checking ${descriptionShort} - ${progress.done}/${progress.total} (${progress.percentage}%)`
			);
		});

		// Do check
		const config = await getConfiguration(
			this._config.connection,
			this._config.getWorkspaceFolder
		);
		const runningCheck = withTimeout<
			ReturnResult<Record<string, PHPStanError[]>>,
			Promise<ReturnResult<Record<string, PHPStanError[]>>>
		>({
			promise: check.check(applyErrors, e),
			timeout:
				checkType === 'file' ? config.timeout : config.projectTimeout,
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
			`Check completed for ${description}`,
			'errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
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

	public async checkFile(
		e: PartialDocument,
		applyErrors: boolean,
		{
			applyErrorsOnAlreadyDone = false,
			force = false,
		}: {
			applyErrorsOnAlreadyDone?: boolean;
			force?: boolean;
		} = {}
	): Promise<void> {
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}

		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText() && !force) {
				if (applyErrorsOnAlreadyDone) {
					await log(
						this._config.connection,
						MANAGER_PREFIX,
						`Re-applying previous errors due to re-open (checkId=${operation.check.id})`
					);
					await operation.check.reApplyErrors(e.uri);
				} else if (operation.check.done) {
					// Same text, no need to run at all
					await log(
						this._config.connection,
						MANAGER_PREFIX,
						`Not checking file "${e.uri}", file has already been checked (checkId=${operation.check.id})`
					);
				} else {
					await log(
						this._config.connection,
						MANAGER_PREFIX,
						`Not checking file "${e.uri}", file check is pending (checkId=${operation.check.id})`
					);
				}

				return this._getFilePromise(e.uri);
			}

			// Different content, kill previous check and start new one
			if (!operation.check.done) {
				// If we are canceling a running apply-errors operation, take over its errors
				applyErrors = operation.applyErrors;
			}
			operation.check.dispose();
		}

		const fileFsPath = URI.parse(e.uri).fsPath;
		const filePath = path.relative(
			this._config.getWorkspaceFolder()!.fsPath,
			fileFsPath
		);
		const check = this._checkShared(
			'file',
			applyErrors,
			e.uri,
			filePath,
			e
		);
		await this._withRecursivePromise(e.uri, check);
		return this._getFilePromise(e.uri);
	}

	public async checkProject(): Promise<void> {
		// Kill current running instances for this project
		const operation = this._operations.get(PROJECT_CHECK_STR);
		if (operation) {
			// Different content, kill previous check and start new one
			operation.check.dispose();
		}

		const check = this._checkShared('project', true, 'Project', 'project');
		await this._withRecursivePromise(PROJECT_CHECK_STR, check);
		return this._getFilePromise(PROJECT_CHECK_STR);
	}

	public async checkFileFromURI(
		uri: string,
		applyErrors: boolean
	): Promise<void> {
		const file = this._config.documents.get(uri);
		if (!file) {
			return;
		}
		return this.checkFile(
			{
				getText: () => file.content,
				uri: file.uri,
				languageId: file.languageId,
			},
			applyErrors
		);
	}

	public clear(): void {
		this.dispose();
		this._config.hooks.provider.clearReports();
	}

	public dispose(): void {
		this._operations.forEach((op) => op.check.dispose());
		this._operations.clear();
	}
}
