// eslint-disable-next-line node/no-extraneous-import
import type { TypedWorkspaceConfiguration } from 'vscode-generate-package-json/dist/types/src/configuration';

import type { LanguageClient } from 'vscode-languageclient/node';
import type { ConfigSettings } from '../../../shared/config';
import { watcherNotification } from './notificationChannels';
import { config } from '../../../shared/commands/defs';
import { window, workspace } from 'vscode';
import { CLIENT_PREFIX, log } from './log';

export function getEditorConfiguration(): TypedWorkspaceConfiguration<ConfigSettings> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}

export function registerEditorConfigurationListener(
	client: LanguageClient
): void {
	const editorConfig = getEditorConfiguration();
	const configValues: Record<string, unknown> = {};
	for (const key in config) {
		configValues[key] = editorConfig.get(key as keyof ConfigSettings);
	}
	log(
		CLIENT_PREFIX,
		'Starting extension with configuration:',
		JSON.stringify(configValues, null, '\t')
	);

	workspace.onDidChangeConfiguration(async (e) => {
		await client.sendNotification(watcherNotification, {
			operation: 'onConfigChange',
		});

		if (e.affectsConfiguration('phpstan.paths')) {
			const editorConfig = getEditorConfiguration();
			const paths = editorConfig.get('phpstan.paths');
			if (
				editorConfig.get('phpstan.enableLanguageServer') &&
				Object.keys(paths).length > 0
			) {
				await window.showWarningMessage(
					'On-hover type information is disabled when the paths setting is being used'
				);
			}
		} else if (
			e.affectsConfiguration('phpstan.pro') ||
			e.affectsConfiguration('phpstan.proTmpDir') ||
			(e.affectsConfiguration('phpstan.enabled') &&
				getEditorConfiguration().get('phpstan.pro'))
		) {
			await window.showInformationMessage(
				'Please reload your editor for changes to the PHPStan Pro configuration to take effect'
			);
		}
	});
}
