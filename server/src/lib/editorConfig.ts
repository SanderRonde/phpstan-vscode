import type {
	ConfigSettingsWithoutPrefix,
	DockerConfigSettings,
} from '../../../shared/config';
import { replaceHomeDir, replaceVariables } from '../../../shared/variables';
import { fromEntries } from '../../../shared/util';
import type { ClassConfig } from './types';

export async function getEditorConfiguration(
	classConfig: Pick<
		ClassConfig,
		'connection' | 'workspaceFolders' | 'editorConfigOverride'
	>
): Promise<Omit<ConfigSettingsWithoutPrefix, 'enableLanguageServer'>> {
	const workspaceFolders = await classConfig.workspaceFolders.get();
	const scope = workspaceFolders?.default?.toString();

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
		showTypeOnHover:
			editorConfig.enableLanguageServer ||
			editorConfig.showTypeOnHover ||
			false,
	};
}

export async function getDockerEnvironment(
	classConfig: Pick<ClassConfig, 'connection' | 'workspaceFolders'>
): Promise<Record<string, string> | null> {
	const workspaceFolders = await classConfig.workspaceFolders.get();
	const scope = workspaceFolders?.default?.toString();
	const editorConfig = {
		...((await classConfig.connection.workspace.getConfiguration({
			scopeUri: scope,
			section: 'docker',
		})) as DockerConfigSettings),
	};
	return editorConfig['docker.environment'];
}
