import { replaceHomeDir, replaceVariables } from '../../../shared/variables';
import type { ConfigSettingsWithoutPrefix } from '../../../shared/config';
import type { Disposable } from 'vscode-languageserver';
import { fromEntries } from '../../../shared/util';
import type { ClassConfig } from './types';

export async function getEditorConfiguration(
	classConfig: Pick<
		ClassConfig,
		'connection' | 'workspaceFolders' | 'editorConfigOverride'
	>
): Promise<ConfigSettingsWithoutPrefix> {
	const workspaceFolders = await classConfig.workspaceFolders.get();
	const scope = workspaceFolders?.default.toString();

	const editorConfig = {
		...((await classConfig.connection.workspace.getConfiguration({
			scopeUri: scope,
			section: 'phpstan',
		})) as ConfigSettingsWithoutPrefix),
		...(await classConfig.editorConfigOverride.get()),
	};

	let tmpDir = editorConfig.tmpDir;
	if (!tmpDir) {
		tmpDir = editorConfig.proTmpDir || editorConfig.tmpDir;
	}
	return {
		...editorConfig,
		binPath: replaceHomeDir(
			replaceVariables(editorConfig.binPath, workspaceFolders)
		),
		binCommand: editorConfig.binCommand.map((part) =>
			replaceHomeDir(replaceVariables(part, workspaceFolders))
		),
		configFile: replaceHomeDir(
			replaceVariables(editorConfig.configFile, workspaceFolders)
		),
		paths: fromEntries(
			Object.entries(editorConfig.paths).map(([key, value]) => [
				replaceVariables(key, workspaceFolders),
				replaceVariables(value, workspaceFolders),
			])
		),
		tmpDir: replaceHomeDir(replaceVariables(tmpDir, workspaceFolders)),
		rootDir: replaceHomeDir(
			replaceVariables(editorConfig.rootDir, workspaceFolders)
		),
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

export function onChangeEditorConfiguration<
	K extends keyof ConfigSettingsWithoutPrefix,
>(
	classConfig: Pick<
		ClassConfig,
		'connection' | 'workspaceFolders' | 'editorConfigOverride'
	>,
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
