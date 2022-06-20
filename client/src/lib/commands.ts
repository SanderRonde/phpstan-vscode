import {
	commandNotification,
	watcherNotification,
} from './notificationChannels';
import { commands, Commands } from '../../../shared/commands/defs';
import { autoRegisterCommand } from 'vscode-generate-package-json';
import type { LanguageClient } from 'vscode-languageclient/node';
import { showError } from './errorUtil';
import * as vscode from 'vscode';

export function registerListeners(
	context: vscode.ExtensionContext,
	client: LanguageClient
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

					await client.sendNotification(watcherNotification, {
						operation: 'watch',
						uri: doc.uri.toString(),
						dirty: doc.isDirty,
						content: doc.getText(),
						languageId: doc.languageId,
					});
				}
			},
			commands
		)
	);

	context.subscriptions.push(
		client.onNotification(
			commandNotification,
			({ commandArgs, commandName }) => {
				void vscode.commands.executeCommand(
					commandName,
					...commandArgs
				);
			}
		)
	);
}
