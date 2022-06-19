import type { _Connection, TextDocuments } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { createPromise, withTimeout } from '../../../../shared/util';
import type { PromiseObject } from '../../../../shared/util';
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
	documents: TextDocuments<TextDocument>;
}

interface CheckOperation {
	fileContent: string;
	check: PHPStanCheck;
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
		dirty: boolean
	): Promise<void> {
		// Create statusbar operation
		const operation = this._config.statusBar.createOperation();
		await operation.start();

		// Prep check
		const config = await getConfiguration(this._config.connection);
		const check = new PHPStanCheck(this._config);
		this._operations.set(e.uri, {
			check,
			fileContent: e.getText(),
		});

		// Do check
		const runningCheck = withTimeout<
			ReturnResult<Diagnostic[]>,
			ReturnResult<Diagnostic[]>
		>({
			promise: check.check(e, dirty),
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

	public async checkFile(e: PartialDocument, dirty: boolean): Promise<void> {
		if (e.languageId !== 'php') {
			await log(
				this._config.connection,
				'Skipping',
				e.languageId,
				'file'
			);
			return;
		}

		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText()) {
				// Same text, no need to run at all
				await log(
					this._config.connection,
					'Not checking file, file already has pending check'
				);
				return this._getFilePromise(e);
			}

			// Different content, kill previous check and start new one
			operation.check.dispose();
		}

		await log(this._config.connection, 'Checking file', e.uri);
		const check = this._checkFile(e, dirty);
		await this._withRecursivePromise(e, check);
		return this._getFilePromise(e);
	}

	public async checkFileFromURI(uri: string): Promise<void> {
		const file = this._config.documents.get(uri);
		if (!file) {
			return;
		}
		return this.checkFile(file, true);
	}

	public dispose(): void {
		this._operations.forEach((op) => op.check.dispose());
		this._operations.clear();
	}
}
