import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PHPStanCheckManager } from './phpstan/manager';
import type { PartialDocument } from './phpstan/runner';
import type { WorkspaceFoldersGetter } from '../server';
import { getConfiguration } from './config';
import { log, WATCHER_PREFIX } from './log';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _connection: _Connection;
	private readonly _phpstan: PHPStanCheckManager;
	private readonly _getWorkspaceFolders: WorkspaceFoldersGetter;
	private readonly _onConnectionInitialized: Promise<void>;

	private get _enabled(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			void (async () => {
				await this._onConnectionInitialized;
				const config = await getConfiguration(
					this._connection,
					this._getWorkspaceFolders
				);
				resolve(config.enabled);
			})();
		});
	}

	public constructor({
		connection,
		phpstan: checkManager,
		onConnectionInitialized,
		getWorkspaceFolders,
	}: {
		connection: _Connection;
		phpstan: PHPStanCheckManager;
		onConnectionInitialized: Promise<void>;
		getWorkspaceFolders: WorkspaceFoldersGetter;
	}) {
		this._connection = connection;
		this._phpstan = checkManager;
		this._getWorkspaceFolders = getWorkspaceFolders;
		this._onConnectionInitialized = onConnectionInitialized;
	}

	private _toPartialDocument(
		e: WatcherNotificationFileData
	): PartialDocument {
		return {
			getText: () => e.content,
			uri: e.uri,
			languageId: e.languageId,
		};
	}

	public async onDocumentChange(
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		await log(
			this._connection,
			WATCHER_PREFIX,
			'Document changed, checking'
		);
		await this._phpstan.checkFile(this._toPartialDocument(e), true);
	}

	public async onDocumentSave(e: WatcherNotificationFileData): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		await log(this._connection, WATCHER_PREFIX, 'Document saved, checking');
		await this._phpstan.checkFile(this._toPartialDocument(e), true);
	}

	public async onDocumentActive(
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		await log(
			this._connection,
			WATCHER_PREFIX,
			'Document active, checking'
		);

		await this._phpstan.checkFile(this._toPartialDocument(e), true);
	}

	public async onDocumentOpen(e: WatcherNotificationFileData): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		await log(
			this._connection,
			WATCHER_PREFIX,
			'Document opened, checking and re-applying errors'
		);
		await this._phpstan.checkFile(this._toPartialDocument(e), true);
	}

	public async onDocumentCheck(
		e: WatcherNotificationFileData
	): Promise<void> {
		await log(this._connection, WATCHER_PREFIX, 'Force checking project');
		await this._phpstan.checkFile(this._toPartialDocument(e), true);
	}

	public async onScanProject(): Promise<void> {
		await this._phpstan.checkProject();
	}

	public clearData(): void {
		this._phpstan.clear();
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
	}
}
