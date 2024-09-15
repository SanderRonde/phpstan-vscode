import type { StatusBarProgress } from '../../../shared/notificationChannels';
import { getReadonlyEditorConfiguration } from '../lib/editorConfig';
import { statusBarNotification } from '../lib/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import type { Commands } from '../../../shared/commands/defs';
import { OperationStatus } from '../../../shared/statusBar';
import { assertUnreachable } from '../../../shared/util';
import { log, STATUS_BAR_PREFIX } from '../lib/log';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';

export class StatusBar implements Disposable {
	private _runningOperation: {
		tooltip: string;
		id: number;
	} | null = null;

	private readonly _textManager = new TextManager();
	private _fallback:
		| {
				text: string;
				command?: Commands;
		  }
		| undefined = undefined;
	private _hideTimeout: NodeJS.Timer | undefined;

	public constructor(
		context: vscode.ExtensionContext,
		client: LanguageClient
	) {
		context.subscriptions.push(
			client.onNotification(statusBarNotification, (params) => {
				log(
					STATUS_BAR_PREFIX,
					"notification:'",
					JSON.stringify(params)
				);

				if (!getReadonlyEditorConfiguration().enableStatusBar) {
					return;
				}

				switch (params.type) {
					case 'new':
						this.startOperation(params.opId, params.tooltip);
						break;
					case 'progress':
						if (!this._runningOperation) {
							this.startOperation(params.opId, params.tooltip);
						}
						if (params.opId === this._runningOperation?.id) {
							this.operationProgress(
								params.progress,
								params.tooltip
							);
						}
						break;
					case 'done':
						if (params.opId === this._runningOperation?.id) {
							this._completeWithResult(
								params.opId,
								params.result
							);
						}
						break;
					case 'fallback':
						if (params.text === undefined) {
							this._fallback = undefined;
						} else {
							this._fallback = {
								text: params.text,
								command: params.command,
							};
						}
						if (!this._runningOperation) {
							this._fallbackOrHide();
						}
						break;
				}
			})
		);
	}

	private _showStatusBar(): void {
		log(STATUS_BAR_PREFIX, 'Showing status bar');
		if (!getReadonlyEditorConfiguration().enableStatusBar) {
			return;
		}

		if (this._hideTimeout) {
			clearInterval(this._hideTimeout);
		}
		this._textManager.setText(
			`PHPStan checking... ${TextManager.LOADING_SPIN}`
		);
		this._textManager.show();
	}

	private _fallbackOrHide(): void {
		if (!this._fallback) {
			this._textManager.hide();
			return;
		}

		this._textManager.setText(this._fallback.text, this._fallback.command);
		this._textManager.show();
	}

	private _completeWithResult(
		operationId: number,
		result: OperationStatus
	): void {
		log(
			STATUS_BAR_PREFIX,
			'Hiding status bar, last operation result =',
			result
		);
		if (result === OperationStatus.KILLED) {
			this._textManager.setText(
				'PHPStan process killed (timeout)',
				this._fallback?.command
			);
		} else if (result === OperationStatus.SUCCESS) {
			this._textManager.setText(
				'PHPStan checking done',
				this._fallback?.command
			);
		} else if (result === OperationStatus.ERROR) {
			this._textManager.setText(
				'PHPStan checking errored (see log)',
				this._fallback?.command
			);
		} else if (result !== OperationStatus.CANCELLED) {
			assertUnreachable(result);
		}
		this._textManager.setText(
			'PHPStan checking done',
			this._fallback?.command
		);
		this._textManager.setTooltips(undefined);
		this._hideTimeout = setTimeout(
			() => {
				this._fallbackOrHide();
				if (this._runningOperation?.id === operationId) {
					this._runningOperation = null;
				}
			},
			result === OperationStatus.ERROR ? 2000 : 500
		);
	}

	private startOperation(operationId: number, tooltip: string): void {
		this._runningOperation = {
			tooltip: tooltip,
			id: operationId,
		};

		if (!this._textManager.isShown()) {
			this._showStatusBar();
		}
	}

	private operationProgress(
		progress: StatusBarProgress,
		tooltip: string
	): void {
		this._textManager.setText(
			`PHPStan checking project ${progress.done}/${progress.total} - ${progress.percentage}% ${TextManager.LOADING_SPIN}`,
			this._fallback?.command
		);
		this._runningOperation!.tooltip = tooltip;
		this._textManager.setTooltips(tooltip);

		this._textManager.show();
	}

	public clearAllRunning(): void {
		if (this._runningOperation) {
			this._runningOperation = null;
		}
		this._textManager.hide();
	}

	public dispose(): void {
		this._fallback = undefined;
		this._textManager.dispose();
	}
}

/**
 * When updating the content of the statusbar, the spinning icon will start
 * from its initial position. That's kind of ugly so we wait with showing
 * the new text until it's restarting the animation.
 */
class TextManager implements Disposable {
	public static readonly LOADING_SPIN = '$(loading~spin)';
	private readonly _statusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		1
	);
	private _pendingStatusBarText: string | null = null;
	private _statusBarInterval: NodeJS.Timeout | null = null;
	private _isShown: boolean = false;

	public constructor() {}

	private _pushStatusBarText(): void {
		if (this._pendingStatusBarText) {
			this._statusBar.text = this._pendingStatusBarText;
			this._pendingStatusBarText = null;
		}
	}

	public isShown(): boolean {
		return this._isShown;
	}

	public setText(text: string, command?: Commands): void {
		if (command) {
			this._statusBar.command = command;
		} else {
			this._statusBar.command = undefined;
		}

		if (this._statusBar.text === text) {
			// Bug-like thing where we need to set the text explicitly even though
			// it was already set to this
			this._statusBar.text = text;
			return;
		}
		if (!text.includes(TextManager.LOADING_SPIN)) {
			this._statusBar.text = text;
			return;
		}
		if (!this._statusBar.text.includes(TextManager.LOADING_SPIN)) {
			// This just now started the animation, set an interval
			if (this._statusBarInterval) {
				clearInterval(this._statusBarInterval);
			}
			this._statusBarInterval = setInterval(() => {
				this._pushStatusBarText();
			}, 1000);
			this._statusBar.text = text;
			return;
		}

		// Queue this new text
		this._pendingStatusBarText = text;
	}

	public setTooltips(tooltip: string | undefined): void {
		this._statusBar.tooltip = tooltip;
	}

	public hide(): void {
		this._isShown = false;
		this._statusBar.hide();
		if (this._statusBarInterval) {
			clearInterval(this._statusBarInterval);
			this._statusBarInterval = null;
		}
		this._pendingStatusBarText = null;
	}

	public show(): void {
		this._isShown = true;
		this._statusBar.show();
	}

	public dispose(): void {
		this.hide();
		this._statusBar.dispose();
	}
}
