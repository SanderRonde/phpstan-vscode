// eslint-disable-next-line node/no-extraneous-import
import type { TypedWorkspaceConfiguration } from 'vscode-generate-package-json/dist/types/src/configuration';

import type { ConfigSettings } from '../../../shared/config';
import { CONFIG_KEYS } from '../../../shared/config';
import { window, workspace } from 'vscode';
import { CLIENT_PREFIX, log } from './log';

export function getEditorConfiguration(): TypedWorkspaceConfiguration<ConfigSettings> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}

export function registerEditorConfigurationListener(): void {
	const editorConfig = getEditorConfiguration();
	const configValues: Record<string, unknown> = {};
	for (const key of CONFIG_KEYS) {
		configValues[key] = editorConfig.get(`phpstan.${key}`);
	}
	log(
		CLIENT_PREFIX,
		'Starting extension with configuration:',
		JSON.stringify(configValues, null, '\t')
	);

	workspace.onDidChangeConfiguration(async (e) => {
		if (e.affectsConfiguration('phpstan.paths')) {
			const editorConfig = getEditorConfiguration();
			const paths = editorConfig.get('phpstan.paths');
			if (Object.keys(paths).length > 0) {
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
