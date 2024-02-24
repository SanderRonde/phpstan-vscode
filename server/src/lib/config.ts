import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { WorkspaceFoldersGetter } from '../server';
import { fromEntries } from '../../../shared/util';

export async function getConfiguration(
	connection: _Connection,
	getWorkspaceFolders: WorkspaceFoldersGetter
): Promise<ConfigSettingsWithoutPrefix> {
	const scope = getWorkspaceFolders()?.default.toString();

	const config = (await connection.workspace.getConfiguration({
		scopeUri: scope,
		section: 'phpstan',
	})) as ConfigSettingsWithoutPrefix;

	return {
		...config,
		binPath: replaceVariables(config.binPath, getWorkspaceFolders),
		binCommand: config.binCommand.map((part) =>
			replaceVariables(part, getWorkspaceFolders)
		),
		configFile: replaceVariables(config.configFile, getWorkspaceFolders),
		paths: fromEntries(
			Object.entries(config.paths).map(([key, value]) => [
				replaceVariables(key, getWorkspaceFolders),
				replaceVariables(value, getWorkspaceFolders),
			])
		),
		rootDir: replaceVariables(config.rootDir, getWorkspaceFolders),
		options: config.options.map((option) =>
			replaceVariables(option, getWorkspaceFolders)
		),
		ignoreErrors: config.ignoreErrors.map((error) =>
			replaceVariables(error, getWorkspaceFolders)
		),
	};
}

function replaceVariables(
	str: string,
	getWorkspaceFolders: WorkspaceFoldersGetter
): string {
	return str.replace(
		/\${workspaceFolder(?::(\w+))?}/g,
		(_fullMatch, workspaceName: string | undefined) => {
			if (workspaceName) {
				const workspaceFoldersByName = getWorkspaceFolders();
				if (!workspaceFoldersByName) {
					throw new Error(
						'workspaceFolder:name is not set but is used in a variable'
					);
				}
				const folder = workspaceFoldersByName[workspaceName];
				if (!folder) {
					throw new Error(
						`workspaceFolder:${workspaceName} is not set but is used in a variable`
					);
				}
				return folder.fsPath;
			}

			const workspaceFolder = getWorkspaceFolders()?.default;
			if (!workspaceFolder) {
				throw new Error(
					'workspaceFolder is not set but is used in a variable'
				);
			}
			return workspaceFolder.fsPath;
		}
	);
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
