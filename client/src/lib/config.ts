import type {
	ConfigSettings,
	TypedWorkspaceConfiguration,
} from '../../../shared/config';
import { window, workspace } from 'vscode';

export function getConfiguration(): TypedWorkspaceConfiguration<ConfigSettings> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}

export function registerConfigListeners(): void {
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
