import { getConfiguration, WhenToRun } from './config';
import { ErrorHandler } from './errorHandler';
import { createDebouncer } from './util';
import { PHPStan } from './phpstan';
import { Disposable } from 'vscode';
import * as vscode from 'vscode';
import { log } from './log';

export class Watcher implements Disposable {
	private _disposables: Disposable[] = [];
	private readonly _errorHandler: ErrorHandler;
	private readonly _phpstan: PHPStan;
	private readonly _debouncer = createDebouncer(1000);

	public constructor({
		errorHandler,
		phpstan,
	}: {
		errorHandler: ErrorHandler;
		phpstan: PHPStan;
	}) {
		this._errorHandler = errorHandler;
		this._phpstan = phpstan;
	}

	private async _onDocumentSave(e: vscode.TextDocument): Promise<void> {
		await this._phpstan.checkFileAndRegisterErrors(e);
	}

	private _onDocumentChange(e: vscode.TextDocument): void {
		this._debouncer.debounce(async () => {
			await this._phpstan.checkFileAndRegisterErrors(e);
		});
	}

	private _onDocumentClose(e: vscode.TextDocument): void {
		this._errorHandler.clearForDocument(e);
	}

	private _watch(prev: WhenToRun, current: WhenToRun): void {
		console.log('prev=', prev, 'current=', current);
		if (current === WhenToRun.NEVER) {
			return;
		}

		if (current === WhenToRun.ON_SAVE) {
			this._disposables.push(
				vscode.workspace.onDidSaveTextDocument((e) => {
					log('Document saved, checking');
					void this._onDocumentSave(e);
				})
			);
		} else if (current === WhenToRun.CONTENT_CHANGE) {
			vscode.workspace.onDidChangeTextDocument((e) => {
				if (
					e.document.uri ===
					vscode.window.activeTextEditor?.document.uri
				) {
					log('Document changed, checking');
					void this._onDocumentChange(e.document);
				}
			});
		}

		if ([WhenToRun.CONTENT_CHANGE, WhenToRun.ON_SAVE].includes(current)) {
			this._disposables.push(
				vscode.workspace.onDidOpenTextDocument((e) => {
					log('Document opened, checking');
					void this._onDocumentSave(e);
				})
			);
			this._disposables.push(
				vscode.window.onDidChangeActiveTextEditor((e) => {
					log('Active editor changed, checking');
					if (e) {
						void this._onDocumentSave(e.document);
					}
				})
			);
		}

		this._disposables.push(
			vscode.workspace.onDidCloseTextDocument(
				this._onDocumentClose.bind(this)
			)
		);

		if (prev !== WhenToRun.NEVER) {
			vscode.workspace.textDocuments.forEach((doc) => {
				log('Checking open document');
				void this._onDocumentSave(doc);
			});
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

	public watch(): void {
		this._watch(
			WhenToRun.NEVER,
			getConfiguration().get('phpstan.whenToRun')
		);
	}

	public dispose(): void {
		Disposable.from(...this._disposables).dispose();
		this._debouncer.dispose();
		this._disposables = [];
	}
}
