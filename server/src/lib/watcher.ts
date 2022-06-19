import type { Disposable, _Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { watcherNotification } from './notificationChannels';
import { createDebouncer } from '../../../shared/util';
import { TextDocuments } from 'vscode-languageserver';
import { WhenToRun } from '../../../shared/config';
import { getConfiguration } from './config';
import type { PHPStan } from './phpstan';
import { log } from './log';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _phpstan: PHPStan;
	private readonly _debouncer = createDebouncer(1000);
	private readonly _connection: _Connection;
	private readonly _documents: TextDocuments<TextDocument>;

	public constructor({
		phpstan,
		connection,
	}: {
		phpstan: PHPStan;
		connection: _Connection;
	}) {
		const documents: TextDocuments<TextDocument> = new TextDocuments(
			TextDocument
		);

		this._phpstan = phpstan;
		this._connection = connection;
		this._documents = documents;

		this._disposables.push(
			this._connection.onNotification(watcherNotification, (data) => {
				if (data.operation === 'watch') {
					const doc = this._documents.get(data.uri);
					if (doc) {
						void this._phpstan.checkFileAndRegisterErrors(
							doc,
							data.dirty
						);
					}
				}
			})
		);
	}

	private async _onDocumentSave(e: TextDocument): Promise<void> {
		await this._phpstan.checkFileAndRegisterErrors(e, false);
	}

	private _onDocumentChange(e: TextDocument): void {
		this._debouncer.debounce(async () => {
			await this._phpstan.checkFileAndRegisterErrors(e, true);
		});
	}

	private async _onDocumentClose(e: TextDocument): Promise<void> {
		await this._connection.sendDiagnostics({
			uri: e.uri,
			diagnostics: [],
		});
	}

	private _watch(current: WhenToRun): void {
		if (current === WhenToRun.NEVER) {
			return;
		}

		if (current === WhenToRun.ON_SAVE) {
			this._disposables.push(
				this._documents.onDidSave(async (e) => {
					await log(this._connection, 'Document saved, checking');
					void this._onDocumentSave(e.document);
				})
			);
		} else if (current === WhenToRun.CONTENT_CHANGE) {
			this._documents.onDidChangeContent(async (e) => {
				await log(this._connection, 'Document changed, checking');
				void this._onDocumentChange(e.document);
			});
		}

		if ([WhenToRun.CONTENT_CHANGE, WhenToRun.ON_SAVE].includes(current)) {
			this._disposables.push(
				this._documents.onDidChangeContent(async (e) => {
					await log(this._connection, 'Document opened, checking');
					void this._onDocumentSave(e.document);
				})
			);
		}

		this._disposables.push(
			this._documents.onDidClose((e) => {
				return this._onDocumentClose(e.document);
			})
		);

		this._disposables.push(
			this._connection.onDidChangeConfiguration(() => {
				void log(
					this._connection,
					'WhenToRun setting changed, re-registering handlers'
				);
				this.dispose();
				void this.watch();
			})
		);
	}

	public async watch(): Promise<void> {
		const config = await getConfiguration(this._connection);
		this._watch(config.phpstan.whenToRun);
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._debouncer.dispose();
		this._disposables = [];
	}
}
