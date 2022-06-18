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
