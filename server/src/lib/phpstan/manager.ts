import type { PHPStanError } from '../../../../shared/notificationChannels';
import { createPromise, withTimeout } from '../../../../shared/util';
import type { ProviderCheckHooks } from '../../providers/shared';
import type { PromiseObject } from '../../../../shared/util';
import type { DocumentManager } from '../documentManager';
import type { _Connection } from 'vscode-languageserver';
import type { Disposable } from 'vscode-languageserver';
import type { PartialDocument } from './runner';
import type { StatusBar } from '../statusBar';
import { executeCommand } from '../commands';
import { getConfiguration } from '../config';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { PHPStanCheck } from './check';
import { log } from '../log';

export interface ClassConfig {
	statusBar: StatusBar;
	connection: _Connection;
	getWorkspaceFolder: () => string | null;
	documents: DocumentManager;
	hooks: {
		provider: ProviderCheckHooks;
	};
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

	private async _onTimeout(): Promise<void> {
		const config = await getConfiguration(this._config.connection);
		if (!config.phpstan.suppressTimeoutMessage) {
			showError(
				this._config.connection,
				`PHPStan check timed out after ${config.phpstan.timeout}ms`,
				[
					{
						title: 'Adjust timeout',
						callback: async () => {
							await executeCommand(
								this._config.connection,
								'workbench.action.openSettings',
								'phpstan.timeout'
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
			`PHPStan check timed out after ${config.phpstan.timeout}ms`
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
		applyErrors: boolean,
		e?: PartialDocument
	): Promise<ReturnResult<Record<string, PHPStanError[]>>> {
		// Prep check
		const check = new PHPStanCheck(this._config);
		this._operations.set(e?.uri ?? PROJECT_CHECK_STR, {
			check,
			fileContent: e?.getText() ?? '',
			applyErrors: true,
		});

		// Create statusbar operation
		const operation = this._config.statusBar.createOperation();
		await operation.start();

		check.onProgress((progress) => {
			void operation.progress(progress);
		});

		// Do check
		const config = await getConfiguration(this._config.connection);
		const runningCheck = withTimeout<
			ReturnResult<Record<string, PHPStanError[]>>,
			ReturnResult<Record<string, PHPStanError[]>>
		>({
			promise: check.check(applyErrors, e),
			timeout: config.phpstan.timeout,
			onKill: () => {
				check.dispose();
				void this._onTimeout();

				return ReturnResult.killed();
			},
		});
		this._disposables.push(runningCheck);
		const result = await runningCheck.promise;

		// Show result of operation in statusbar
		await operation.finish(result.status);

		return result;
	}

	private async _checkFile(
		e: PartialDocument,
		applyErrors: boolean
	): Promise<void> {
		const result = await this._checkShared(applyErrors, e);

		await log(
			this._config.connection,
			'File check done for file',
			e.uri,
			'errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
	}

	private async _checkProject(): Promise<void> {
		const result = await this._checkShared(true);

		await log(
			this._config.connection,
			'Check done for project',
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
		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText() && !force) {
				if (applyErrorsOnAlreadyDone) {
					await log(
						this._config.connection,
						'Re-applying previous errors due to re-open'
					);
					await operation.check.reApplyErrors(e.uri);
				} else {
					// Same text, no need to run at all
					await log(
						this._config.connection,
						'Not checking file, file has already been checked or check is pending'
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

		void log(this._config.connection, 'Checking file', e.uri);
		const check = this._checkFile(e, applyErrors);
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

		void log(this._config.connection, 'Checking project');
		const check = this._checkProject();
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
				dirty: file.dirty,
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
