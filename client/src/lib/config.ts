import type {
	ConfigSettings,
	TypedWorkspaceConfiguration,
} from '../../../shared/config';
import { CONFIG_KEYS } from '../../../shared/config';
import { window, workspace } from 'vscode';
import { CLIENT_PREFIX, log } from './log';

export function getConfiguration(): TypedWorkspaceConfiguration<ConfigSettings> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}

export function registerConfigListeners(): void {
	const config = getConfiguration();
	const configValues: Record<string, unknown> = {};
	for (const key of CONFIG_KEYS) {
		configValues[key] = config.get(
			`phpstan.${key}` as keyof ConfigSettings
		);
	}
	log(
		CLIENT_PREFIX,
		'Starting extension with configuration:',
		JSON.stringify(configValues, null, '\t')
	);

	workspace.onDidChangeConfiguration(async (e) => {
		if (e.affectsConfiguration('phpstan.paths')) {
			const config = getConfiguration();
			const paths = config.get('phpstan.paths');
			if (Object.keys(paths).length > 0) {
				await window.showWarningMessage(
					'On-hover type information is disabled when the paths setting is being used'
				);
			}
		}
	});
}
