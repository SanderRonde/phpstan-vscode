import { getConfiguration } from './config';
import { assertUnreachable } from './util';
import { Disposable } from 'vscode';
import * as vscode from 'vscode';
import { log } from './log';

export enum OperationResult {
	SUCCESS = 'Success',
	KILLED = 'Killed',
	SUPERCEDED = 'Superceded',
}

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
			(lastResult: OperationResult) => this._hideStatusBar(lastResult)
		);
	}

	private _showStatusBar(): void {
		log('Showing status bar');
		if (!getConfiguration().get('phpstan.enableStatusBar')) {
			return;
		}

		if (this._hideTimeout) {
			clearInterval(this._hideTimeout);
		}
		this._statusBar.text = 'PHPStan checking.. $(loading~spin)';
		this._statusBar.show();
	}

	private _hideStatusBar(lastResult: OperationResult): void {
		log('Hiding status bar, last operation result =', lastResult);
		if (lastResult === OperationResult.KILLED) {
			this._statusBar.text = 'PHPStan process killed (timeout)';
		} else if (lastResult === OperationResult.SUCCESS) {
			this._statusBar.text = 'PHPStan checking done';
		} else if (lastResult !== OperationResult.SUPERCEDED) {
			assertUnreachable(lastResult);
		}
		this._statusBar.text = 'PHPStan checking done';
		this._hideTimeout = setTimeout(() => {
			this._statusBar.hide();
		}, 500);
	}

	public pushOperation(operation: Promise<OperationResult>): void {
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
		private readonly _onNoOperations: (lastResult: OperationResult) => void
	) {}

	private _checkOperations(): void {
		const lastOperation =
			this._runningOperations[this._runningOperations.length - 1];
		this._runningOperations = this._runningOperations.filter(
			(o) => !o.done
		);
		if (this._runningOperations.length === 0 && lastOperation) {
			this._onNoOperations(lastOperation.result!);
		}
	}

	public pushOperation(operation: Promise<OperationResult>): void {
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
	public result: null | OperationResult = null;

	public constructor(promise: Promise<OperationResult>) {
		void promise.then((result) => {
			this.result = result;
			this.done = true;
		});
	}
}
