import {
	commandNotification,
	watcherNotification,
} from './notificationChannels';
import type { ErrorManager } from '../notificationReceivers/errorManager';
import type { PHPStanProManager } from '../notificationReceivers/pro';
import { commands, Commands } from '../../../shared/commands/defs';
// eslint-disable-next-line node/no-extraneous-import
import { autoRegisterCommand } from 'vscode-generate-package-json';
import type { LanguageClient } from 'vscode-languageclient/node';
import { showError } from './errorUtil';
import * as vscode from 'vscode';

export function registerListeners(
	context: vscode.ExtensionContext,
	client: LanguageClient,
	errorManager: ErrorManager,
	phpstanProManager: PHPStanProManager
): void {
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
			Commands.NEXT_ERROR,
			() => {
				return errorManager.jumpToError('next');
			},
			commands
		)
	);

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.PREVIOUS_ERROR,
			() => {
				return errorManager.jumpToError('prev');
			},
			commands
		)
	);

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.OPEN_PHPSTAN_PRO,
			() => {
				if (!phpstanProManager.port) {
					void vscode.window.showErrorMessage(
						'PHPStan Pro is not running'
					);
					return;
				}
				void vscode.env.openExternal(
					vscode.Uri.parse(
						`http://127.0.0.1:${phpstanProManager.port}`
					)
				);
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
