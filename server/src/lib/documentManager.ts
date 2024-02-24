import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { Disposable, _Connection } from 'vscode-languageserver';
import { watcherNotification } from './notificationChannels';
import { assertUnreachable } from '../../../shared/util';
import type { Watcher } from './watcher';
import * as phpParser from 'php-parser';
import { URI } from 'vscode-uri';

class DocumentManagerFileData implements WatcherNotificationFileData {
	private _isValid?: boolean;

	public readonly uri: string;
	public readonly content: string;
	public readonly languageId: string;

	public get isValid(): boolean {
		if (this._isValid === undefined) {
			this._isValid = this._checkValid();
		}
		return this._isValid;
	}

	public constructor(fileData: WatcherNotificationFileData) {
		this.uri = fileData.uri;
		this.content = fileData.content;
		this.languageId = fileData.languageId;
	}

	private _checkValid(): boolean {
		const parser = new phpParser.Engine({});
		try {
			parser.parseCode(this.content, URI.parse(this.uri).fsPath);
			return true;
		} catch (e) {
			return false;
		}
	}
}

export class DocumentManager implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _connection: _Connection;
	private readonly _documents: Map<string, DocumentManagerFileData> =
		new Map();
	private _watcher?: Watcher;

	public constructor(connection: _Connection) {
		this._connection = connection;
	}

	private async _onDocumentChange(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, new DocumentManagerFileData(e));
		await this._watcher!.onDocumentChange(e);
	}

	private async _onDocumentSave(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, new DocumentManagerFileData(e));
		await this._watcher!.onDocumentSave(e);
	}

	private async _onDocumentCheck(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, new DocumentManagerFileData(e));
		await this._watcher!.onDocumentCheck(e);
	}

	private async _onDocumentActive(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, new DocumentManagerFileData(e));
		await this._watcher!.onDocumentActive(e);
	}

	private async _onDocumentOpen(
		e: WatcherNotificationFileData,
		check: boolean
	): Promise<void> {
		this._documents.set(e.uri, new DocumentManagerFileData(e));
		if (check) {
			await this._watcher!.onDocumentOpen(e);
		}
	}

	private _onDocumentClose(e: WatcherNotificationFileData): void {
		this._documents.delete(e.uri);
	}

	public setWatcher(watcher: Watcher): void {
		this._watcher = watcher;
		this._disposables.push(
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			this._connection.onNotification(watcherNotification, (data) => {
				switch (data.operation) {
					case 'change':
						return this._onDocumentChange(data.file);
					case 'open':
						return this._onDocumentOpen(data.file, data.check);
					case 'save':
						return this._onDocumentSave(data.file);
					case 'setActive':
						return this._onDocumentActive(data.file);
					case 'close':
						return this._onDocumentClose(data.file);
					case 'check':
						return this._onDocumentCheck(data.file);
					case 'clear':
						return this._watcher!.clearData();
					case 'checkProject':
						return this._watcher!.onScanProject();
					default:
						assertUnreachable(data);
				}
			})
		);
	}

	public get(uri: string): WatcherNotificationFileData | null {
		return this._documents.get(uri) ?? null;
	}

	public getAll(): Record<string, string> {
		const result: Record<string, string> = {};
		for (const [uri, data] of this._documents.entries()) {
			result[uri] = data.content;
		}

		return result;
	}

	public getInvalidFile(): string | null {
		for (const [uri, data] of this._documents.entries()) {
			if (!data.isValid) {
				return uri;
			}
		}
		return null;
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
	}
}
