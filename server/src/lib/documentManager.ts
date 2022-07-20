import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { Disposable, _Connection } from 'vscode-languageserver';
import { watcherNotification } from './notificationChannels';
import type { Debouncer } from '../../../shared/util';
import type { Watcher } from './watcher';

export class DocumentManager implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _connection: _Connection;
	private readonly _documents: Map<string, WatcherNotificationFileData> =
		new Map();
	private readonly _debouncers: Map<string, Debouncer> = new Map();
	private readonly _watcher: Watcher;

	public constructor({
		connection,
		watcher,
	}: {
		connection: _Connection;
		watcher: Watcher;
	}) {
		this._connection = connection;
		this._watcher = watcher;

		this._disposables.push(
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			this._connection.onNotification(watcherNotification, (data) => {
				switch (data.operation) {
					case 'change':
						return this._onDocumentChange(data.file);
					case 'open':
						return this._onDocumentOpen(data.file);
					case 'save':
						return this._onDocumentSave(data.file);
					case 'setActive':
						return this._onDocumentActive(data.file);
					case 'close':
						return this._onDocumentClose(data.file);
					case 'check':
						return this._onDocumentCheck(data.file);
					case 'clear':
						return this._watcher.clearData();
				}
			})
		);
	}

	private async _onDocumentChange(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, e);
		await this._watcher.onDocumentChange(e);
	}

	private async _onDocumentSave(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, e);
		await this._watcher.onDocumentSave(e);
	}

	private async _onDocumentCheck(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, e);
		await this._watcher.onDocumentCheck(e);
	}

	private async _onDocumentActive(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.set(e.uri, e);
		await this._watcher.onDocumentActive(e);
	}

	private _onDocumentOpen(e: WatcherNotificationFileData): void {
		this._documents.set(e.uri, e);
	}

	private async _onDocumentClose(
		e: WatcherNotificationFileData
	): Promise<void> {
		this._documents.delete(e.uri);
		await this._watcher.onDocumentClose(e);
	}

	public get(uri: string): WatcherNotificationFileData | null {
		return this._documents.get(uri) ?? null;
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		[...this._debouncers.values()].forEach((d) => void d.dispose());
		this._disposables = [];
		this._debouncers.clear();
	}
}
