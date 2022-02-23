import { autoRegisterCommand } from 'vscode-generate-package-json';
import { showError } from '../lib/error-util';
import { commands, Commands } from './defs';
import { PHPStan } from '../lib/phpstan';
import * as vscode from 'vscode';

export function registerListeners(
	context: vscode.ExtensionContext,
	phpstan: PHPStan
): void {
	context.subscriptions.push(
		autoRegisterCommand(
			Commands.SCAN_CURRENT_FOR_ERRORS,
			async () => {
				const doc = vscode.window.activeTextEditor?.document;
				if (doc) {
					if (doc.languageId !== 'php') {
						showError('Only PHP files can be scanned for errors');
						return;
					}
					await phpstan.checkFileAndRegisterErrors(doc);
				}
			},
			commands
		)
	);
}
