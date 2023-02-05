import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { WorkspaceFolderGetter } from '../server';

export function getConfiguration(
	connection: _Connection,
	getWorkspaceFolder: WorkspaceFolderGetter
): Promise<ConfigSettingsWithoutPrefix> {
	const scope = getWorkspaceFolder()?.toString();

	return connection.workspace.getConfiguration({
		scopeUri: scope,
		section: 'phpstan',
	}) as Promise<ConfigSettingsWithoutPrefix>;
}

export function onChangeConfiguration<
	K extends keyof ConfigSettingsWithoutPrefix
>(
	connection: _Connection,
	getWorkspaceFolder: WorkspaceFolderGetter,
	key: K,
	handler: (value: ConfigSettingsWithoutPrefix[K]) => void
): Disposable {
	void getConfiguration(connection, getWorkspaceFolder).then((config) => {
		handler(config[key]);
	});
	return connection.onDidChangeConfiguration(() => {
		void getConfiguration(connection, getWorkspaceFolder).then((config) => {
			handler(config[key]);
		});
	});
}
