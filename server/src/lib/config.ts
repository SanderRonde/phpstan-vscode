import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { WorkspaceFoldersGetter } from '../server';

export function getConfiguration(
	connection: _Connection,
	getWorkspaceFolders: WorkspaceFoldersGetter
): Promise<ConfigSettingsWithoutPrefix> {
	const scope = getWorkspaceFolders()?.default.toString();

	return connection.workspace.getConfiguration({
		scopeUri: scope,
		section: 'phpstan',
	}) as Promise<ConfigSettingsWithoutPrefix>;
}

export function onChangeConfiguration<
	K extends keyof ConfigSettingsWithoutPrefix
>(
	connection: _Connection,
	getWorkspaceFolders: WorkspaceFoldersGetter,
	key: K,
	handler: (value: ConfigSettingsWithoutPrefix[K]) => void
): Disposable {
	void getConfiguration(connection, getWorkspaceFolders).then((config) => {
		handler(config[key]);
	});
	return connection.onDidChangeConfiguration(() => {
		void getConfiguration(connection, getWorkspaceFolders).then(
			(config) => {
				handler(config[key]);
			}
		);
	});
}
