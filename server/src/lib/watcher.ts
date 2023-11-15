import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PHPStanCheckManager } from './phpstan/manager';
import type { PartialDocument } from './phpstan/runner';
import type { WorkspaceFolderGetter } from '../server';
import { getConfiguration } from './config';
import { log, WATCHER_PREFIX } from './log';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _connection: _Connection;
	private readonly _phpstan: PHPStanCheckManager;
	private readonly _getWorkspaceFolder: WorkspaceFolderGetter;
	private readonly _onConnectionInitialized: Promise<void>;

	private get _enabled(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			void (async () => {
				await this._onConnectionInitialized;
				const config = await getConfiguration(
					this._connection,
					this._getWorkspaceFolder
				);
				resolve(config.enabled);
			})();
		});
	}

	public constructor({
		connection,
		phpstan: checkManager,
		onConnectionInitialized,
		getWorkspaceFolder,
	}: {
		connection: _Connection;
		phpstan: PHPStanCheckManager;
		onConnectionInitialized: Promise<void>;
		getWorkspaceFolder: WorkspaceFolderGetter;
	}) {
		this._connection = connection;
		this._phpstan = checkManager;
		this._getWorkspaceFolder = getWorkspaceFolder;
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
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await this._phpstan.checkProject();
	}

	public async onDocumentSave(e: WatcherNotificationFileData): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		await log(this._connection, WATCHER_PREFIX, 'Document saved, checking');
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await this._phpstan.checkProject();
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

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await this._phpstan.checkProject();
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
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await this._phpstan.checkProject();
	}

	public async onDocumentCheck(
		e: WatcherNotificationFileData
	): Promise<void> {
		await log(this._connection, WATCHER_PREFIX, 'Force checking project');
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await this._phpstan.checkProject();
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
