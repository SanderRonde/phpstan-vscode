import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import { assertUnreachable, basicHash } from '../../../shared/util';
import type { PHPStanCheckManager } from './phpstan/checkManager';
import type { PartialDocument } from './phpstan/processRunner';
import { watcherNotification } from './notificationChannels';
import { OperationStatus } from '../../../shared/statusBar';
import type { AsyncDisposable, ClassConfig } from './types';
import type { Disposable } from 'vscode-languageserver';
import { getEditorConfiguration } from './editorConfig';
import type { ConfigResolver } from './configResolver';
import { debug, sanitizeFilePath } from '../lib/debug';
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

export class DocumentManager implements AsyncDisposable {
	private _disposables: Disposable[] = [];
	private _lastActiveDocument: PartialDocument | null = null;
	private readonly _documents: Map<string, DocumentManagerFileData> =
		new Map();
	private readonly _onConnectionInitialized: Promise<void>;
	private readonly _configResolver: ConfigResolver;
	public watcher: Watcher | null;

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
			'connection' | 'workspaceFolders' | 'editorConfigOverride'
		>,
		{
			phpstan: checkManager,
			onConnectionInitialized,
			watcher,
			configResolver,
		}: {
			phpstan?: PHPStanCheckManager;
			onConnectionInitialized: Promise<void>;
			watcher: Watcher | null;
			configResolver: ConfigResolver;
		}
	) {
		this.watcher = watcher;
		this._configResolver = configResolver;
		if (watcher) {
			watcher.documentManager = this;
		}
		this._onConnectionInitialized = onConnectionInitialized;

		if (checkManager) {
			this._disposables.push(
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				this._classConfig.connection.onNotification(
					watcherNotification,
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					async (data) => {
						debug(this._classConfig.connection, 'documentManager', {
							data: {
								operation: data.operation,
							},
						});
						switch (data.operation) {
							case 'close':
								this._documents.delete(data.file.uri);
								return;
							case 'clear':
								void this._clearData(checkManager);
								return;
							case 'checkProject':
								return this._onScanCurrentProject(
									checkManager,
									data.file
								);
							case 'checkAllProjects':
								return this._onScanAllProjects(checkManager);
							case 'onConfigChange': {
								checkManager.clearCheckIfChangedCache();
								return this._onConfigChange(
									checkManager,
									data.file
								);
							}
						}

						debug(this._classConfig.connection, 'documentManager', {
							data: {
								file: {
									uri: sanitizeFilePath(data.file.uri),
									content: basicHash(data.file.content),
								},
							},
						});
						this._documents.set(
							data.file.uri,
							new DocumentManagerFileData(
								data.file,
								await this._hasEnabledValidityCheck()
							)
						);
						switch (data.operation) {
							case 'change':
								return this.onDocumentChange(
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

	public async onDocumentChange(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}

		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await checkManager.checkWithDebounce(
			e,
			URI.parse(e.uri),
			'Document changed',
			null
		);
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
		await checkManager.checkWithDebounce(
			e,
			URI.parse(e.uri),
			'Document saved',
			null
		);
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

		this._lastActiveDocument = this._toPartialDocument(e);
		await checkManager.checkIfChanged(e, 'New document active');
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

		await checkManager.checkWithDebounce(
			e,
			URI.parse(e.uri),
			'Document opened',
			null
		);
	}

	private async _onDocumentCheck(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData
	): Promise<void> {
		if (e.languageId !== 'php' || e.uri.endsWith('.git')) {
			return;
		}
		await checkManager.checkWithDebounce(
			e,
			URI.parse(e.uri),
			'Force trigger',
			null
		);
	}

	private async _onConfigChange(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData | null
	): Promise<void> {
		if (!(await this._enabled)) {
			return;
		}

		const editorConfig = await getEditorConfiguration(this._classConfig);
		if (!editorConfig.singleFileMode) {
			if ((await this._classConfig.workspaceFolders.get())?.default) {
				await this._onScanCurrentProject(checkManager, e);
			} else {
				await this._onScanAllProjects(checkManager);
			}
		}
		void this.watcher?.onConfigChange();
	}

	private async _onScanCurrentProject(
		checkManager: PHPStanCheckManager,
		e: WatcherNotificationFileData | null
	): Promise<void> {
		await checkManager.checkWithDebounce(
			undefined,
			e ? URI.parse(e.uri) : null,
			'Manual project scan',
			null
		);
	}

	private async _onScanAllProjects(
		checkManager: PHPStanCheckManager
	): Promise<void> {
		const configFiles = await this._configResolver.getAllConfigs();

		for (const configFile of configFiles) {
			const status = await checkManager.check(
				undefined,
				URI.file(configFile.uri.fsPath),
				'Manual all-projects scan',
				null
			);
			if (status !== OperationStatus.SUCCESS) {
				return;
			}
		}
	}

	private async _clearData(checkManager: PHPStanCheckManager): Promise<void> {
		await checkManager.clear();
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

	public async dispose(): Promise<void> {
		this._disposables.forEach((d) => void d.dispose());
		await this.watcher?.dispose();
		this._disposables = [];
	}
}
