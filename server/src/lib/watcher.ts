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
	private _enabled: Promise<boolean>;

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

		this._enabled = onConnectionInitialized.then(() => {
			this._disposables.push(
				this._connection.onDidChangeConfiguration(() => {
					void log(
						this._connection,
						WATCHER_PREFIX,
						'Enabled setting changed, re-registering handlers'
					);
					this._enabled = getConfiguration(
						this._connection,
						getWorkspaceFolder
					).then((config) => config.enabled);
				})
			);

			return getConfiguration(this._connection, getWorkspaceFolder).then(
				(config) => config.enabled
			);
		});
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
		await this._phpstan.checkFile(this._toPartialDocument(e), true, {
			applyErrorsOnAlreadyDone: true,
		});
	}

	public async onDocumentCheck(
		e: WatcherNotificationFileData
	): Promise<void> {
		await log(this._connection, WATCHER_PREFIX, 'Force checking document');
		await this._phpstan.checkFile(this._toPartialDocument(e), true, {
			force: true,
		});
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
