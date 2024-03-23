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
	private readonly _queuedCalls: Map<
		string,
		{
			fn: () => void | Promise<void>;
			timeout: NodeJS.Timeout;
		}
	> = new Map();

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

	private debounceWithKey(
		identifier: string,
		callback: () => void | Promise<void>
	): void {
		if (this._queuedCalls.has(identifier)) {
			clearTimeout(this._queuedCalls.get(identifier)!.timeout);
		}
		this._queuedCalls.set(identifier, {
			fn: callback,
			timeout: setTimeout(() => {
				this._queuedCalls.delete(identifier);
				void callback();
			}, 50),
		});
	}

	public async onDocumentChange(
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		this.debounceWithKey(e.uri, async () => {
			await log(
				this._connection,
				WATCHER_PREFIX,
				'Document changed, triggering'
			);
			await this._phpstan.checkProject();
		});
	}

	public async onDocumentSave(e: WatcherNotificationFileData): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		this.debounceWithKey(e.uri, async () => {
			await log(
				this._connection,
				WATCHER_PREFIX,
				'Document saved, triggering'
			);
			await this._phpstan.checkProject();
		});
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

		this.debounceWithKey(e.uri, async () => {
			await log(
				this._connection,
				WATCHER_PREFIX,
				`New document active (${e.uri}), triggering`
			);
			this._lastActiveDocument = this._toPartialDocument(e);
			await this._phpstan.checkProjectIfFileChanged(e.uri, e.content);
		});
	}

	public async onDocumentOpen(e: WatcherNotificationFileData): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}

		this.debounceWithKey(e.uri, async () => {
			await log(
				this._connection,
				WATCHER_PREFIX,
				'Document opened, triggering and re-applying errors'
			);
			await this._phpstan.checkProject();
		});
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
