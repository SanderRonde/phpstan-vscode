import type { StatusBarProgress } from '../../../shared/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import { statusBarNotification } from './notificationChannels';
import { OperationStatus } from '../../../shared/statusBar';
import { assertUnreachable } from '../../../shared/util';
import { getConfiguration } from './config';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';
import { log } from './log';

export class StatusBar implements Disposable {
	private readonly _opTracker: OperationTracker;
	private readonly _statusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		1
	);
	private _hideTimeout: NodeJS.Timer | undefined;

	public constructor(
		context: vscode.ExtensionContext,
		client: LanguageClient
	) {
		this._opTracker = new OperationTracker(
			() => this._showStatusBar(),
			(lastResult: OperationStatus) => this._hideStatusBar(lastResult)
		);
		context.subscriptions.push(
			client.onNotification(statusBarNotification, (params) => {
				if (params.progress) {
					this.operationProgress(params.progress);
				} else if (!params.result) {
					this.startOperation(params.opId);
				} else {
					this.finishOperation(params.opId, params.result);
				}
			})
		);
	}

	private _showStatusBar(): void {
		log(STATUS_BAR_PREFIX, 'Showing status bar');
		if (!getConfiguration().get('phpstan.enableStatusBar')) {
			return;
		}

		if (this._hideTimeout) {
			clearInterval(this._hideTimeout);
		}
		this._statusBar.text = 'PHPStan checking.. $(loading~spin)';
		this._statusBar.show();
	}

	private _hideStatusBar(lastResult: OperationStatus): void {
		log(
			STATUS_BAR_PREFIX,
			'Hiding status bar, last operation result =',
			lastResult
		);
		if (lastResult === OperationStatus.KILLED) {
			this._statusBar.text = 'PHPStan process killed (timeout)';
		} else if (lastResult === OperationStatus.SUCCESS) {
			this._statusBar.text = 'PHPStan checking done';
		} else if (lastResult === OperationStatus.ERROR) {
			this._statusBar.text = 'PHPStan checking errored (see log)';
		} else if (lastResult !== OperationStatus.CANCELED) {
			assertUnreachable(lastResult);
		}
		this._statusBar.text = 'PHPStan checking done';
		this._hideTimeout = setTimeout(
			() => {
				this._statusBar.hide();
			},
			lastResult === OperationStatus.ERROR ? 2000 : 500
		);
	}

	private startOperation(operationId: number): void {
		this._opTracker.startOperation(operationId);
	}

	private operationProgress(progress: StatusBarProgress): void {
		this._statusBar.text = `PHPStan checking project ${progress.done}/${progress.total} - ${progress.percentage}% $(loading~spin)`;
		this._statusBar.show();
	}

	private finishOperation(
		operationId: number,
		result: OperationStatus
	): void {
		this._opTracker.finishOperation(operationId, result);
	}

	public dispose(): void {
		this._opTracker.dispose();
		this._statusBar.dispose();
	}
}

class OperationTracker implements Disposable {
	private _runningOperations: Map<number, Resolvable> = new Map();

	public constructor(
		private readonly _onHasOperations: () => void,
		private readonly _onNoOperations: (lastResult: OperationStatus) => void
	) {}

	private _checkOperations(): void {
		let lastOperation: OperationStatus | null = null;
		for (const operationId of this._runningOperations.keys()) {
			if (this._runningOperations.get(operationId)!.done) {
				lastOperation =
					this._runningOperations.get(operationId)!.result;
				this._runningOperations.delete(operationId);
			}
		}

		if (this._runningOperations.size === 0 && lastOperation) {
			this._onNoOperations(lastOperation);
		}
	}

	public startOperation(operationId: number): void {
		const hadOperations = this._runningOperations.size > 0;
		this._runningOperations.set(operationId, new Resolvable());
		if (!hadOperations) {
			this._onHasOperations();
		}
	}

	public finishOperation(operationId: number, result: OperationStatus): void {
		this._runningOperations.get(operationId)?.complete(result);
		this._checkOperations();
	}

	public dispose(): void {
		this._runningOperations.clear();
	}
}

class Resolvable {
	public done: boolean = false;
	public result: null | OperationStatus = null;

	public complete(result: OperationStatus): void {
		this.done = true;
		this.result = result;
	}
}
