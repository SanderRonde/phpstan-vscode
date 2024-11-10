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
import { getDebugData } from '../notificationReceivers/debug';
import { getEditorConfiguration } from './editorConfig';
import { showError } from './errorUtil';

import { launchSetup } from './setup';
import * as vscode from 'vscode';

export function registerListeners(
	context: vscode.ExtensionContext,
	client: LanguageClient,
	errorManager: ErrorManager,
	phpstanProManager: PHPStanProManager,
	outputChannel: vscode.OutputChannel
): void {
	context.subscriptions.push(
		autoRegisterCommand(
			Commands.SCAN_FILE_FOR_ERRORS,
			async () => {
				const editorConfig = getEditorConfiguration();
				if (!editorConfig.get('phpstan.singleFileMode')) {
					showError(
						'Please enable single-file mode in the settings to scan a single file. Instead use "Scan project for errors" to scan the whole project.'
					);
					return;
				}

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
					operation: 'checkAllProjects',
				});
			},
			commands
		)
	);
	context.subscriptions.push(
		autoRegisterCommand(
			Commands.SCAN_CURRENT_PROJECT,
			async () => {
				await client.sendNotification(watcherNotification, {
					operation: 'checkProject',
					file: vscode.window.activeTextEditor
						? {
								content:
									vscode.window.activeTextEditor.document.getText(),
								uri: vscode.window.activeTextEditor.document.uri.toString(),
								languageId:
									vscode.window.activeTextEditor.document
										.languageId,
							}
						: null,
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
		autoRegisterCommand(
			Commands.LAUNCH_SETUP,
			() => launchSetup(client),
			commands
		)
	);

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.SHOW_OUTPUT_CHANNEL,
			() => outputChannel.show(),
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

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.CLEAR_ERRORS,
			() => errorManager.clearErrors(),
			commands
		)
	);

	context.subscriptions.push(
		autoRegisterCommand(
			Commands.DOWNLOAD_DEBUG_DATA,
			async () => {
				const debugData = getDebugData();
				const json = JSON.stringify(debugData, null, '\t');
				const timestamp = Date.now();
				const uri = vscode.Uri.joinPath(
					vscode.workspace.workspaceFolders?.[0]?.uri ??
						vscode.Uri.file(''),
					`phpstan-vscode-debug-${timestamp}.json`
				);
				await vscode.workspace.fs.writeFile(uri, Buffer.from(json));

				await vscode.commands.executeCommand('vscode.open', uri);
			},
			commands
		)
	);
}
