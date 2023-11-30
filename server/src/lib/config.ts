import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PromisedValue } from '../server';
import type { URI } from 'vscode-uri';

export async function getConfiguration(
	connection: _Connection,
	workspaceFolder: PromisedValue<URI | null>
): Promise<ConfigSettingsWithoutPrefix> {
	const scope = (await workspaceFolder.get())?.toString();

	return connection.workspace.getConfiguration({
		scopeUri: scope,
		section: 'phpstan',
	}) as Promise<ConfigSettingsWithoutPrefix>;
}

export function onChangeConfiguration<
	K extends keyof ConfigSettingsWithoutPrefix
>(
	connection: _Connection,
	workspaceFolder: PromisedValue<URI | null>,
	key: K,
	handler: (value: ConfigSettingsWithoutPrefix[K]) => void
): Disposable {
	void getConfiguration(connection, workspaceFolder).then((config) => {
		handler(config[key]);
	});
	return connection.onDidChangeConfiguration(() => {
		void getConfiguration(connection, workspaceFolder).then((config) => {
			handler(config[key]);
		});
	});
}
