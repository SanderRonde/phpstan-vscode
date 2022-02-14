import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log(
		'Congratulations, your extension "phpstan-vscode" is now active!'
	);
	let disposable = vscode.commands.registerCommand(
		'phpstan-vscode.helloWorld',
		() => {
			vscode.window.showInformationMessage('Hello World from phpstan!');
		}
	);
	context.subscriptions.push(disposable);
}

export function deactivate() {}
