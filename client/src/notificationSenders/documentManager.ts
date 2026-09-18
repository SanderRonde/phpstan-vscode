import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import { debug, sanitizeFilePath } from '../notificationReceivers/debug';
import { watcherNotification } from '../lib/notificationChannels';
import { isSupportedLanguageId } from '../../../shared/languages';
import type { LanguageClient } from 'vscode-languageclient/node';
import { getEditorConfiguration } from '../lib/editorConfig';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';
import * as path from 'path';
type PartialDocument = Pick<
	vscode.TextDocument,
	'uri' | 'getText' | 'isDirty' | 'languageId'
>;

export class DocumentManager implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _client: LanguageClient;

	public constructor(client: LanguageClient) {
		this._client = client;
	}

	private _shouldSyncDocument(
		e: PartialDocument,
		changes?: readonly vscode.TextDocumentContentChangeEvent[]
	): boolean {
		return (
			isSupportedLanguageId(e.languageId) &&
			!e.isDirty &&
			(!changes || changes.length === 0) &&
			['file', 'vscode-vfs', 'git', 'vscode-remote'].includes(
				e.uri.scheme
			)
		);
	}

	private _isConfigFilePath(fsPath: string): boolean {
		const configFiles = getEditorConfiguration()
			.get('phpstan.configFile')
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		const normalizedFsPath = path.normalize(fsPath);
		for (const configFile of configFiles) {
			const normalizedSetting = path.normalize(configFile);
			if (
				path.basename(normalizedFsPath) !==
				path.basename(normalizedSetting)
			) {
				continue;
			}
			const isBareFilename =
				!configFile.includes('/') && !configFile.includes('\\');
			if (
				isBareFilename ||
				normalizedFsPath === normalizedSetting ||
				normalizedFsPath.endsWith(path.sep + normalizedSetting)
			) {
				return true;
			}
		}
		return false;
	}

	private _isConfigFile(e: PartialDocument): boolean {
		if (e.isDirty) {
			return false;
		}
		return this._isConfigFilePath(e.uri.fsPath);
	}

	private _toSendData(e: PartialDocument): WatcherNotificationFileData {
		return {
			uri: e.uri.toString(),
			content: e.getText(),
			languageId: e.languageId,
		};
	}

	private async _onDocumentChange(
		e: vscode.TextDocumentChangeEvent
	): Promise<void> {
		if (this._isConfigFile(e.document)) {
			debug('configChange', {
				filePath: sanitizeFilePath(e.document.uri.fsPath),
			});
			await this._client.sendNotification(watcherNotification, {
				operation: 'onConfigChange',
				file: this._toSendData(e.document),
			});
		}
		if (this._shouldSyncDocument(e.document, e.contentChanges)) {
			debug('documentChange', {
				checking: true,
				filePath: sanitizeFilePath(e.document.uri.fsPath),
			});
			await this._client.sendNotification(watcherNotification, {
				operation: 'change',
				file: this._toSendData(e.document),
			});
		}
	}

	private async _onDocumentSave(e: vscode.TextDocument): Promise<void> {
		if (this._isConfigFilePath(e.uri.fsPath)) {
			debug('configChange', {
				filePath: sanitizeFilePath(e.uri.fsPath),
			});
			await this._client.sendNotification(watcherNotification, {
				operation: 'onConfigChange',
				file: this._toSendData(e),
			});
		}

		if (!isSupportedLanguageId(e.languageId)) {
			return;
		}

		debug('documentSave', {
			filePath: sanitizeFilePath(e.uri.fsPath),
		});
		await this._client.sendNotification(watcherNotification, {
			operation: 'save',
			file: this._toSendData(e),
		});
	}

	private async _onDocumentActive(e: vscode.TextDocument): Promise<void> {
		if (this._shouldSyncDocument(e)) {
			debug('documentActive', {
				filePath: sanitizeFilePath(e.uri.fsPath),
			});
			await this._client.sendNotification(watcherNotification, {
				operation: 'setActive',
				file: this._toSendData(e),
			});
		}
	}

	private async _onDocumentOpen(
		e: vscode.TextDocument,
		check: boolean
	): Promise<void> {
		if (this._shouldSyncDocument(e)) {
			debug('documentOpen', {
				filePath: sanitizeFilePath(e.uri.fsPath),
				check,
			});
			await this._client.sendNotification(watcherNotification, {
				operation: 'open',
				file: this._toSendData(e),
				check,
			});
		}
	}

	private async _onDocumentClose(e: PartialDocument): Promise<void> {
		if (this._shouldSyncDocument(e)) {
			debug('documentClose', {
				filePath: sanitizeFilePath(e.uri.fsPath),
			});
			await this._client.sendNotification(watcherNotification, {
				operation: 'close',
				file: this._toSendData(e),
			});
		}
	}

	public async watch(): Promise<void> {
		debug('watch', 'Starting document watch');
		await Promise.all(
			vscode.workspace.textDocuments.map((doc) => {
				return this._onDocumentOpen(doc, false);
			})
		);

		this._disposables.push(
			vscode.window.onDidChangeActiveTextEditor((e) => {
				if (e) {
					void this._onDocumentActive(e?.document);
				}
			})
		);

		this._disposables.push(
			vscode.workspace.onDidSaveTextDocument((e) => {
				void this._onDocumentSave(e);
			})
		);

		this._disposables.push(
			vscode.workspace.onDidSaveTextDocument((e) => {
				void this._onDocumentActive(e);
			})
		);

		this._disposables.push(
			vscode.workspace.onDidChangeTextDocument((e) => {
				void this._onDocumentChange(e);
			})
		);

		this._disposables.push(
			vscode.workspace.onDidCloseTextDocument((e) => {
				void this._onDocumentClose(e);
			})
		);

		if (vscode.window.activeTextEditor) {
			void this._onDocumentActive(
				vscode.window.activeTextEditor.document
			);
		}
	}

	public dispose(): void {
		debug('dispose', 'Disposing document manager');
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
	}
}
