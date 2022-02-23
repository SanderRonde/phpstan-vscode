import { getConfiguration } from './config';
import { Disposable } from 'vscode';
import * as vscode from 'vscode';

export class StatusBar implements Disposable {
	private readonly _opTracker: OperationTracker;
	private readonly _statusBar = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		1
	);
	private _hideTimeout: NodeJS.Timer | undefined;

	public constructor() {
		this._opTracker = new OperationTracker(
			() => this._showStatusBar(),
			() => this._hideStatusBar()
		);
	}

	private _showStatusBar(): void {
		if (!getConfiguration().get('phpstan.enableStatusBar')) {
			return;
		}

		if (this._hideTimeout) {
			clearInterval(this._hideTimeout);
		}
		this._statusBar.text = 'PHPStan checking.. $(loading~spin)';
		this._statusBar.show();
	}

	private _hideStatusBar(): void {
		this._statusBar.text = 'PHPStan checking done';
		this._hideTimeout = setTimeout(() => {
			this._statusBar.hide();
		}, 500);
	}

	public pushOperation(operation: Promise<void>): void {
		this._opTracker.pushOperation(operation);
	}

	public dispose(): void {
		this._opTracker.dispose();
		this._statusBar.dispose();
	}
}

class OperationTracker implements Disposable {
	private _runningOperations: Resolvable[] = [];

	public constructor(
		private readonly _onHasOperations: () => void,
		private readonly _onNoOperations: () => void
	) {}

	private _checkOperations(): void {
		this._runningOperations = this._runningOperations.filter(
			(o) => !o.done
		);
		if (this._runningOperations.length === 0) {
			this._onNoOperations();
		}
	}

	public pushOperation(operation: Promise<void>): void {
		const hadOperations = this._runningOperations.length > 0;
		this._runningOperations.push(new Resolvable(operation));
		void operation.then(() => this._checkOperations());
		if (!hadOperations) {
			this._onHasOperations();
		}
	}

	public dispose(): void {
		this._runningOperations = [];
	}
}

class Resolvable {
	public done: boolean = false;

	public constructor(promise: Promise<void>) {
		void promise.then(() => {
			this.done = true;
		});
	}
}
