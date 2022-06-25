import { createPromise, withTimeout } from '../../../../shared/util';
import type { ProviderCheckHooks } from '../../providers/shared';
import type { PromiseObject } from '../../../../shared/util';
import type { DocumentManager } from '../documentManager';
import type { _Connection } from 'vscode-languageserver';
import type { Diagnostic } from 'vscode-languageserver';
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

	private async _checkFile(
		e: PartialDocument,
		applyErrors: boolean
	): Promise<void> {
		// Prep check
		const check = new PHPStanCheck(this._config);
		this._operations.set(e.uri, {
			check,
			fileContent: e.getText(),
			applyErrors,
		});

		// Create statusbar operation
		const operation = this._config.statusBar.createOperation();
		await operation.start();

		// Do check
		const config = await getConfiguration(this._config.connection);
		const runningCheck = withTimeout<
			ReturnResult<Diagnostic[]>,
			ReturnResult<Diagnostic[]>
		>({
			promise: check.check(e, applyErrors),
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
		await log(
			this._config.connection,
			'File check done for file',
			e.uri,
			'errors=',
			JSON.stringify(
				result.success() ? result.value.map((err) => err.message) : []
			)
		);
	}

	private async _getFilePromise(doc: PartialDocument): Promise<void> {
		if (!this._filePromises.has(doc.uri)) {
			return Promise.resolve();
		}
		let obj: RecursivePromiseObject = this._filePromises.get(doc.uri)!;
		do {
			obj = await obj.promise;
		} while (obj !== null);
	}

	private async _withRecursivePromise(
		doc: PartialDocument,
		operation: Promise<void>
	): Promise<void> {
		const promise = await createPromise<RecursivePromiseObject>();
		const prevPromise = this._filePromises.get(doc.uri);
		if (prevPromise) {
			prevPromise.resolve(promise);
		}
		this._filePromises.set(doc.uri, promise);

		void operation.then(() => {
			promise.resolve(null);
		});
	}

	public async checkFile(
		e: PartialDocument,
		applyErrors: boolean
	): Promise<void> {
		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText()) {
				// Same text, no need to run at all
				await log(
					this._config.connection,
					'Not checking file, file has already been checked or check is pending'
				);
				return this._getFilePromise(e);
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
		await this._withRecursivePromise(e, check);
		return this._getFilePromise(e);
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

	public dispose(): void {
		this._operations.forEach((op) => op.check.dispose());
		this._operations.clear();
	}
}
