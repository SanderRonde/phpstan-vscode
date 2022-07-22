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
						operation: 'check',
						file: {
							content: doc.getText(),
							dirty: doc.isDirty,
							uri: doc.uri.toString(),
							languageId: doc.languageId,
						},
					});
				}
			},
			commands
		)
	);

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.SCAN_PROJECT,
			async () => {
				await client.sendNotification(watcherNotification, {
					operation: 'checkProject',
				});
			},
			commands
		)
	);

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.RELOAD,
			async () => {
				const doc = vscode.window.activeTextEditor?.document;
				if (doc) {
					if (doc.languageId !== 'php') {
						showError('Only PHP files can be scanned for errors');
						return;
					}

					await client.sendNotification(watcherNotification, {
						operation: 'clear',
					});
					await client.sendNotification(watcherNotification, {
						operation: 'check',
						file: {
							content: doc.getText(),
							dirty: doc.isDirty,
							uri: doc.uri.toString(),
							languageId: doc.languageId,
						},
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
