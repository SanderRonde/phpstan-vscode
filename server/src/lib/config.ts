import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PHPStanConfig } from '../../../shared/config';
import type { WorkspaceFolderGetter } from '../server';

export function getConfiguration(
	connection: _Connection,
	getWorkspaceFolder: WorkspaceFolderGetter
): Promise<PHPStanConfig> {
	const scope = getWorkspaceFolder()?.toString();

	return connection.workspace.getConfiguration({
		scopeUri: scope,
		section: 'phpstan',
	}) as Promise<PHPStanConfig>;
}

export function onChangeConfiguration<K extends keyof PHPStanConfig>(
	connection: _Connection,
	getWorkspaceFolder: WorkspaceFolderGetter,
	key: K,
	handler: (value: PHPStanConfig[K]) => void
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
