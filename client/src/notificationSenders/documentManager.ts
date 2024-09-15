import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import { getReadonlyEditorConfiguration } from '../lib/editorConfig';
import { watcherNotification } from '../lib/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';

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

	private _shouldSyncDocument(e: PartialDocument): boolean {
		return e.languageId === 'php' && !e.isDirty;
	}

	private _isConfigFile(e: PartialDocument): boolean {
		if (e.isDirty) {
			return false;
		}
		for (const configFileString of getReadonlyEditorConfiguration()
			.configFiles) {
			const configFiles = configFileString
				.split(',')
				.map((e) => e.trim());
			for (const configFile of configFiles) {
				if (e.uri.fsPath.includes(configFile)) {
					return true;
				}
			}
		}
		return false;
	}

	private _toSendData(e: PartialDocument): WatcherNotificationFileData {
		return {
			uri: e.uri.toString(),
			content: e.getText(),
			languageId: e.languageId,
		};
	}

	private async _onDocumentChange(e: vscode.TextDocument): Promise<void> {
		if (this._isConfigFile(e)) {
			await this._client.sendNotification(watcherNotification, {
				operation: 'onConfigChange',
				file: this._toSendData(e),
			});
		}
		if (this._shouldSyncDocument(e)) {
			await this._client.sendNotification(watcherNotification, {
				operation: 'change',
				file: this._toSendData(e),
			});
		}
	}

	private async _onDocumentSave(e: vscode.TextDocument): Promise<void> {
		if (this._shouldSyncDocument(e)) {
			await this._client.sendNotification(watcherNotification, {
				operation: 'save',
				file: this._toSendData(e),
			});
		}
	}

	private async _onDocumentActive(e: vscode.TextDocument): Promise<void> {
		if (this._shouldSyncDocument(e)) {
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
			await this._client.sendNotification(watcherNotification, {
				operation: 'open',
				file: this._toSendData(e),
				check,
			});
		}
	}

	private async _onDocumentClose(e: PartialDocument): Promise<void> {
		if (this._shouldSyncDocument(e)) {
			await this._client.sendNotification(watcherNotification, {
				operation: 'close',
				file: this._toSendData(e),
			});
		}
	}

	public async watch(): Promise<void> {
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
				void this._onDocumentChange(e.document);
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
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
	}
}
