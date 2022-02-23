import { registerListeners } from './commands/commands';
import { ErrorHandler } from './lib/errorHandler';
import { StatusBar } from './lib/statusBar';
import { Watcher } from './lib/watcher';
import { PHPStan } from './lib/phpstan';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
	const errorHandler = new ErrorHandler();
	const statusBar = new StatusBar();
	const phpstan = new PHPStan({
		errorHandler,
		statusBar,
		context,
	});
	const watcher = new Watcher({
		errorHandler,
		phpstan,
	});
	watcher.watch();

	registerListeners(context, phpstan);

	context.subscriptions.push(errorHandler, statusBar, phpstan, watcher);
}

export function deactivate(): void {}
