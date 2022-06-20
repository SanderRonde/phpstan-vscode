import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PHPStanCheckManager } from './phpstan/manager';
import type { PartialDocument } from './phpstan/runner';
import { createDebouncer } from '../../../shared/util';
import type { Debouncer } from '../../../shared/util';
import { WhenToRun } from '../../../shared/config';
import { getConfiguration } from './config';
import { log } from './log';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _connection: _Connection;
	private readonly _phpstan: PHPStanCheckManager;
	private readonly _debouncers: Map<string, Debouncer> = new Map();
	private _whenToRun!: Promise<WhenToRun>;

	public constructor({
		connection,
		phpstan: checkManager,
		onConnectionInitialized,
	}: {
		connection: _Connection;
		phpstan: PHPStanCheckManager;
		onConnectionInitialized: Promise<void>;
	}) {
		this._connection = connection;
		this._phpstan = checkManager;

		this._whenToRun = onConnectionInitialized.then(() => {
			this._disposables.push(
				this._connection.onDidChangeConfiguration(() => {
					void log(
						this._connection,
						'WhenToRun setting changed, re-registering handlers'
					);
					this._whenToRun = getConfiguration(this._connection).then(
						(config) => config.phpstan.whenToRun
					);
				})
			);

			return getConfiguration(this._connection).then(
				(config) => config.phpstan.whenToRun
			);
		});
	}

	private _toPartialDocument(
		e: WatcherNotificationFileData
	): PartialDocument {
		return {
			getText: () => e.content,
			uri: e.uri,
			dirty: e.dirty,
		};
	}

	public async onDocumentChange(
		e: WatcherNotificationFileData
	): Promise<void> {
		if ((await this._whenToRun) === WhenToRun.CONTENT_CHANGE) {
			if (!this._debouncers.has(e.uri)) {
				this._debouncers.set(e.uri, createDebouncer(1000));
			}
			this._debouncers.get(e.uri)!.debounce(async () => {
				await log(this._connection, 'Document changed, checking');
				await this._phpstan.checkFile(this._toPartialDocument(e), true);
			});
		}
	}

	public async onDocumentSave(e: WatcherNotificationFileData): Promise<void> {
		if (
			(await this._whenToRun) === WhenToRun.ON_SAVE ||
			(await this._whenToRun) === WhenToRun.CONTENT_CHANGE
		) {
			await log(this._connection, 'Document saved, checking');
			await this._phpstan.checkFile(this._toPartialDocument(e), true);
		}
	}

	public async onDocumentActive(
		e: WatcherNotificationFileData
	): Promise<void> {
		await log(this._connection, 'Document active, checking');

		if ((await this._whenToRun) !== WhenToRun.NEVER) {
			await this._phpstan.checkFile(this._toPartialDocument(e), true);
		}
	}

	public async onDocumentClose(
		e: WatcherNotificationFileData
	): Promise<void> {
		await this._connection.sendDiagnostics({
			uri: e.uri,
			diagnostics: [],
		});
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		[...this._debouncers.values()].forEach((d) => void d.dispose());
		this._disposables = [];
		this._debouncers.clear();
	}
}
