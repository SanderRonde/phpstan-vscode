// eslint-disable-next-line node/no-extraneous-import
import type { TypedWorkspaceConfiguration } from 'vscode-generate-package-json/dist/types/src/configuration';

import type {
	ConfigSettings,
	ExternalConfigSettings,
} from '../../../shared/config';
import type { LanguageClient } from 'vscode-languageclient/node';
import { watcherNotification } from './notificationChannels';
import { config } from '../../../shared/commands/defs';
import type { ExtensionContext } from 'vscode';
import { window, workspace } from 'vscode';
import { CLIENT_PREFIX, log } from './log';

export function getEditorConfiguration(): TypedWorkspaceConfiguration<
	ConfigSettings & ExternalConfigSettings
> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}

export function registerEditorConfigurationListener(
	context: ExtensionContext,
	client: LanguageClient
): void {
	const editorConfig = getEditorConfiguration();
	const configValues: Record<string, unknown> = {};
	for (const key in config) {
		configValues[key] = editorConfig.get(key as keyof ConfigSettings);
	}
	log(
		context,
		CLIENT_PREFIX,
		'Starting extension with configuration:',
		JSON.stringify(configValues, null, '\t')
	);

	workspace.onDidChangeConfiguration(async (e) => {
		if (!e.affectsConfiguration('phpstan')) {
			return;
		}

		await client.sendNotification(watcherNotification, {
			operation: 'onConfigChange',
			file: null,
		});

		if (e.affectsConfiguration('phpstan.paths')) {
			const editorConfig = getEditorConfiguration();
			const paths = editorConfig.get('phpstan.paths');
			if (
				(editorConfig.get('phpstan.showTypeOnHover') ||
					editorConfig.get('phpstan.enableLanguageServer')) &&
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
