import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PromisedValue, WorkspaceFolders } from '../server';
import { fromEntries } from '../../../shared/util';

export async function getConfiguration(
	connection: _Connection,
	workspaceFoldersP: PromisedValue<WorkspaceFolders | null>
): Promise<ConfigSettingsWithoutPrefix> {
	const workspaceFolders = await workspaceFoldersP.get();
	const scope = workspaceFolders?.default.toString();

	const config = (await connection.workspace.getConfiguration({
		scopeUri: scope,
		section: 'phpstan',
	})) as ConfigSettingsWithoutPrefix;

	return {
		...config,
		binPath: replaceVariables(config.binPath, workspaceFolders),
		binCommand: config.binCommand.map((part) =>
			replaceVariables(part, workspaceFolders)
		),
		configFile: replaceVariables(config.configFile, workspaceFolders),
		paths: fromEntries(
			Object.entries(config.paths).map(([key, value]) => [
				replaceVariables(key, workspaceFolders),
				replaceVariables(value, workspaceFolders),
			])
		),
		proTmpDir: replaceVariables(config.proTmpDir, workspaceFolders),
		rootDir: replaceVariables(config.rootDir, workspaceFolders),
		options: config.options.map((option) =>
			replaceVariables(option, workspaceFolders)
		),
		ignoreErrors: config.ignoreErrors.map((error) =>
			replaceVariables(error, workspaceFolders)
		),
	};
}

function replaceVariables(
	str: string,
	workspaceFolders: WorkspaceFolders | null
): string {
	return str.replace(
		/\${workspaceFolder(?::(\w+))?}/g,
		(_fullMatch, workspaceName: string | undefined) => {
			if (workspaceName) {
				if (!workspaceFolders) {
					throw new Error(
						'workspaceFolder:name is not set but is used in a variable'
					);
				}
				const folder = workspaceFolders[workspaceName];
				if (!folder) {
					throw new Error(
						`workspaceFolder:${workspaceName} is not set but is used in a variable`
					);
				}
				return folder.fsPath;
			}

			const workspaceFolder = workspaceFolders?.default;
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
	K extends keyof ConfigSettingsWithoutPrefix,
>(
	connection: _Connection,
	workspaceFolders: PromisedValue<WorkspaceFolders | null>,
	key: K,
	handler: (value: ConfigSettingsWithoutPrefix[K]) => void
): Disposable {
	void getConfiguration(connection, workspaceFolders).then((config) => {
		handler(config[key]);
	});
	return connection.onDidChangeConfiguration(() => {
		void getConfiguration(connection, workspaceFolders).then((config) => {
			handler(config[key]);
		});
	});
}
