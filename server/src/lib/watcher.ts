import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PromisedValue, WorkspaceFolders } from '../server';
import type { PHPStanCheckManager } from './phpstan/manager';
import type { PartialDocument } from './phpstan/runner';
import { getConfiguration } from './config';
import { log, WATCHER_PREFIX } from './log';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private _lastActiveDocument: PartialDocument | null = null;
	private readonly _connection: _Connection;
	private readonly _phpstan: PHPStanCheckManager;
	private readonly _workspaceFolders: PromisedValue<WorkspaceFolders | null>;
	private readonly _onConnectionInitialized: Promise<void>;

	private get _enabled(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			void (async () => {
				await this._onConnectionInitialized;
				const config = await getConfiguration(
					this._connection,
					this._workspaceFolders
				);
				resolve(config.enabled);
			})();
		});
	}

	public constructor({
		connection,
		phpstan: checkManager,
		onConnectionInitialized,
		workspaceFolders,
	}: {
		connection: _Connection;
		phpstan: PHPStanCheckManager;
		onConnectionInitialized: Promise<void>;
		workspaceFolders: PromisedValue<WorkspaceFolders | null>;
	}) {
		this._connection = connection;
		this._phpstan = checkManager;
		this._workspaceFolders = workspaceFolders;
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
			'Document changed, triggering'
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
		await log(
			this._connection,
			WATCHER_PREFIX,
			'Document saved, triggering'
		);
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

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}

		if (e.uri === this._lastActiveDocument?.uri) {
			return;
		}
		await log(
			this._connection,
			WATCHER_PREFIX,
			`New document active (${e.uri}), triggering`
		);
		this._lastActiveDocument = this._toPartialDocument(e);
		await this._phpstan.checkProjectIfFileChanged(e.uri, e.content);
	}

	public async onDocumentOpen(e: WatcherNotificationFileData): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		await log(
			this._connection,
			WATCHER_PREFIX,
			'Document opened, triggering and re-applying errors'
		);
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await this._phpstan.checkProject();
	}

	public async onDocumentCheck(
		e: WatcherNotificationFileData
	): Promise<void> {
		await log(this._connection, WATCHER_PREFIX, 'Force triggering project');
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
