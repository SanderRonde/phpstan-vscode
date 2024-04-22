import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { ClassConfig, WorkspaceFolders } from './types';
import type { Disposable } from 'vscode-languageserver';
import { fromEntries } from '../../../shared/util';

export async function getEditorConfiguration(
	classConfig: Pick<ClassConfig, 'connection' | 'workspaceFolders'>
): Promise<ConfigSettingsWithoutPrefix> {
	const workspaceFolders = await classConfig.workspaceFolders.get();
	const scope = workspaceFolders?.default.toString();

	const editorConfig =
		(await classConfig.connection.workspace.getConfiguration({
			scopeUri: scope,
			section: 'phpstan',
		})) as ConfigSettingsWithoutPrefix;

	return {
		...editorConfig,
		binPath: replaceVariables(editorConfig.binPath, workspaceFolders),
		binCommand: editorConfig.binCommand.map((part) =>
			replaceVariables(part, workspaceFolders)
		),
		configFile: replaceVariables(editorConfig.configFile, workspaceFolders),
		paths: fromEntries(
			Object.entries(editorConfig.paths).map(([key, value]) => [
				replaceVariables(key, workspaceFolders),
				replaceVariables(value, workspaceFolders),
			])
		),
		proTmpDir: replaceVariables(editorConfig.proTmpDir, workspaceFolders),
		rootDir: replaceVariables(editorConfig.rootDir, workspaceFolders),
		options: editorConfig.options.map((option) =>
			replaceVariables(option, workspaceFolders)
		),
		ignoreErrors: editorConfig.ignoreErrors.map((error) => {
			if (error instanceof RegExp) {
				return new RegExp(
					replaceVariables(error.source, workspaceFolders)
				);
			}
			return replaceVariables(error, workspaceFolders);
		}),
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

export function onChangeEditorConfiguration<
	K extends keyof ConfigSettingsWithoutPrefix,
>(
	classConfig: Pick<ClassConfig, 'connection' | 'workspaceFolders'>,
	key: K,
	handler: (value: ConfigSettingsWithoutPrefix[K]) => void
): Disposable {
	void getEditorConfiguration(classConfig).then((editorConfig) => {
		handler(editorConfig[key]);
	});
	return classConfig.connection.onDidChangeConfiguration(() => {
		void getEditorConfiguration(classConfig).then((editorConfig) => {
			handler(editorConfig[key]);
		});
	});
}
