import { NotificationChannel } from '../../../shared/notificationChannels';
import { commands, Commands } from '../../../server/src/commands/defs';
import { autoRegisterCommand } from 'vscode-generate-package-json';
import type { LanguageClient } from 'vscode-languageclient/node';
import { showError } from '../../../server/src/lib/errorUtil';
import type { WatcherNotification } from './watcher';
import * as vscode from 'vscode';

export interface CommandMessage {
	commandName: string;
	commandArgs: string[];
}

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

					await client.sendNotification(NotificationChannel.WATCHER, {
						operation: 'watch',
						uri: doc.uri.toString(),
					} as WatcherNotification);
				}
			},
			commands
		)
	);

	context.subscriptions.push(
		client.onNotification(
			NotificationChannel.COMMAND,
			({ commandArgs, commandName }: CommandMessage) => {
				void vscode.commands.executeCommand(
					commandName,
					...commandArgs
				);
			}
		)
	);
}
