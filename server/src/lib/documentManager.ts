import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import type { PHPStanCheckManager } from './phpstan/checkManager';
import type { PartialDocument } from './phpstan/processRunner';
import { watcherNotification } from './notificationChannels';
import { assertUnreachable } from '../../../shared/util';
import type { Disposable } from 'vscode-languageserver';
import { getEditorConfiguration } from './editorConfig';
import { log, WATCHER_PREFIX } from './log';
import type { ClassConfig } from './types';
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

	public constructor(
		fileData: WatcherNotificationFileData,
		enableValidCheck: boolean
	) {
		this.uri = fileData.uri;
		this.content = fileData.content;
		this.languageId = fileData.languageId;
		if (!enableValidCheck) {
			this._isValid = true;
		}
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
	private _lastActiveDocument: PartialDocument | null = null;
	private readonly _documents: Map<string, DocumentManagerFileData> =
		new Map();
	private readonly _onConnectionInitialized: Promise<void>;
	private readonly _queuedCalls: Map<
		string,
		{
			fn: () => void | Promise<void>;
			timeout: NodeJS.Timeout;
		}
	> = new Map();

	private async _hasEnabledValidityCheck(): Promise<boolean> {
		return (await getEditorConfiguration(this._classConfig)).checkValidity;
	}

	private get _enabled(): Promise<boolean> {
		return new Promise<boolean>((resolve) => {
			void (async () => {
				await this._onConnectionInitialized;
				resolve(
					(await getEditorConfiguration(this._classConfig)).enabled
				);
			})();
		});
	}

	public constructor(
		private readonly _classConfig: Pick<
			ClassConfig,
			'connection' | 'workspaceFolders'
		>,
		{
			phpstan: checkManager,
			onConnectionInitialized,
		}: {
			phpstan?: PHPStanCheckManager;
			onConnectionInitialized: Promise<void>;
		}
	) {
		this._onConnectionInitialized = onConnectionInitialized;

		if (checkManager) {
			this._disposables.push(
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				this._classConfig.connection.onNotification(
					watcherNotification,
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					async (data) => {
						switch (data.operation) {
							case 'close':
								this._documents.delete(data.file.uri);
								return;
							case 'clear':
								this._clearData(checkManager);
								return;
							case 'checkProject':
								return this._onScanProject(checkManager);
						}

						this._documents.set(
							data.file.uri,
							new DocumentManagerFileData(
								data.file,
								await this._hasEnabledValidityCheck()
							)
						);
						switch (data.operation) {
							case 'change':
								return this._onDocumentChange(
									checkManager,
									data.file
								);
							case 'open':
								if (data.check) {
									return this._onDocumentOpen(
										checkManager,
										data.file
									);
								}
								break;
							case 'save':
								return this._onDocumentSave(
									checkManager,
									data.file
								);
							case 'setActive':
								return this._onDocumentActive(
									checkManager,
									data.file
								);
							case 'check':
								return this._onDocumentCheck(
									checkManager,
									data.file
								);
							default:
								assertUnreachable(data);
						}
						return;
					}
				)
			);
		}
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

	private _debounceWithKey(
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

	private async _onDocumentChange(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		this._debounceWithKey(e.uri, async () => {
			await log(
				this._classConfig.connection,
				WATCHER_PREFIX,
				'Document changed, triggering'
			);
			await checkManager.check(e);
		});
	}

	private async _onDocumentSave(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		this._debounceWithKey(e.uri, async () => {
			await log(
				this._classConfig.connection,
				WATCHER_PREFIX,
				'Document saved, triggering'
			);
			await checkManager.check(e);
		});
	}

	private async _onDocumentActive(
		checkManager: PHPStanCheckManager,
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

		this._debounceWithKey(e.uri, async () => {
			await log(
				this._classConfig.connection,
				WATCHER_PREFIX,
				`New document active (${e.uri}), triggering`
			);
			this._lastActiveDocument = this._toPartialDocument(e);
			await checkManager.checkIfChanged(e);
		});
	}

	private async _onDocumentOpen(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}

		this._debounceWithKey(e.uri, async () => {
			await log(
				this._classConfig.connection,
				WATCHER_PREFIX,
				'Document opened, triggering and re-applying errors'
			);
			await checkManager.check(e);
		});
	}

	private async _onDocumentCheck(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData
	): Promise<void> {
		await log(
			this._classConfig.connection,
			WATCHER_PREFIX,
			'Force triggering project'
		);
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await checkManager.check(e);
	}

	private async _onScanProject(
		checkManager: PHPStanCheckManager
	): Promise<void> {
		await checkManager.check(undefined);
	}

	private _clearData(checkManager: PHPStanCheckManager): void {
		checkManager.clear();
	}

	public getFile(uri: string): WatcherNotificationFileData | null {
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
