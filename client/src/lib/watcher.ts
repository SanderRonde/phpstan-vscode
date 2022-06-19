import type { LanguageClient } from 'vscode-languageclient/node';
import { watcherNotification } from './notificationChannels';
import { createDebouncer } from '../../../shared/util';
import { WhenToRun } from '../../../shared/config';
import { log } from '../../../client/src/lib/log';
import { getConfiguration } from './config';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _debouncer = createDebouncer(1000);
	private readonly _client: LanguageClient;

	public constructor(client: LanguageClient) {
		this._client = client;
	}

	private async _onDocumentSave(e: vscode.TextDocument): Promise<void> {
		await this._client.sendNotification(watcherNotification, {
			operation: 'watch',
			uri: e.uri.toString(),
			dirty: e.isDirty,
		});
	}

	private _watch(firstRun: boolean, current: WhenToRun): void {
		if (current === WhenToRun.NEVER) {
			return;
		}

		if ([WhenToRun.CONTENT_CHANGE, WhenToRun.ON_SAVE].includes(current)) {
			this._disposables.push(
				vscode.window.onDidChangeActiveTextEditor((e) => {
					if (e) {
						log('Active editor changed, checking');
						void this._onDocumentSave(e.document);
					}
				})
			);
		}

		if (firstRun && vscode.window.activeTextEditor) {
			void this._onDocumentSave(vscode.window.activeTextEditor.document);
		}

		this._disposables.push(
			vscode.workspace.onDidChangeConfiguration((e) => {
				if (e.affectsConfiguration('phpstan.whenToRun')) {
					log('WhenToRun setting changed, re-registering handlers');
					this.dispose();
					this.watch();
				}
			})
		);
	}

	public watch(firstRun: boolean = false): void {
		this._watch(firstRun, getConfiguration().get('phpstan.whenToRun'));
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._debouncer.dispose();
		this._disposables = [];
	}
}
