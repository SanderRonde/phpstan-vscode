import type {
	ConfigSettings,
	TypedWorkspaceConfiguration,
} from '../../../shared/config';
import type { _Connection } from 'vscode-languageserver';

export function getConfiguration(
	connection: _Connection
): Promise<TypedWorkspaceConfiguration<ConfigSettings>> {
	return connection.workspace.getConfiguration() as Promise<
		TypedWorkspaceConfiguration<ConfigSettings>
	>;
}
