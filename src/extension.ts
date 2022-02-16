import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
	console.log(
		'Congratulations, your extension "phpstan-vscode" is now active!'
	);
	const disposable = vscode.commands.registerCommand(
		'phpstan-vscode.helloWorld',
		async () => {
			await vscode.window.showInformationMessage(
				'Hello World from phpstan!'
			);
		}
	);
	context.subscriptions.push(disposable);
}

export function deactivate(): void {}
