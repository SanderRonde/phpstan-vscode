import type {
	ConfigSettingsWithoutPrefix,
	DockerConfigSettings,
} from '../../../shared/config';
import { replaceHomeDir, replaceVariables } from '../../../shared/variables';
import type { ClassConfig, WorkspaceFolders } from './types';
import { fromEntries } from '../../../shared/util';
import { showErrorOnce } from './errorUtil';
import type { URI } from 'vscode-uri';

/**
 * Resolves which workspace folder settings/variables should be scoped to,
 * preferring the folder that actually contains `currentFile` over the
 * first-added folder when multiple workspace folders are open.
 */
function resolveWorkspaceFolder(
	classConfig: Pick<ClassConfig, 'connection'>,
	workspaceFolders: WorkspaceFolders | null,
	currentFile: URI | null
): WorkspaceFolders | null {
	if (!workspaceFolders) {
		return null;
	}
	const matchedFolder = currentFile
		? workspaceFolders.getForPath(currentFile.fsPath)
		: undefined;
	if (
		currentFile &&
		!matchedFolder &&
		Object.keys(workspaceFolders.byName).length > 1
	) {
		showErrorOnce(
			classConfig.connection,
			`Could not determine which open workspace folder "${currentFile.fsPath}" belongs to; falling back to the first workspace folder. Use "\${workspaceFolder:name}" in your settings to disambiguate.`
		);
	}
	if (!matchedFolder) {
		return workspaceFolders;
	}
	return {
		...workspaceFolders,
		default: matchedFolder,
	};
}

export async function getEditorConfiguration(
	classConfig: Pick<
		ClassConfig,
		'connection' | 'workspaceFolders' | 'editorConfigOverride'
	>,
	currentFile: URI | null = null
): Promise<Omit<ConfigSettingsWithoutPrefix, 'enableLanguageServer'>> {
	const workspaceFolders = resolveWorkspaceFolder(
		classConfig,
		await classConfig.workspaceFolders.get(),
		currentFile
	);
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
	classConfig: Pick<ClassConfig, 'connection' | 'workspaceFolders'>,
	currentFile: URI | null = null
): Promise<Record<string, string> | null> {
	const workspaceFolders = resolveWorkspaceFolder(
		classConfig,
		await classConfig.workspaceFolders.get(),
		currentFile
	);
	const scope = workspaceFolders?.default?.toString();
	const editorConfig = {
		...((await classConfig.connection.workspace.getConfiguration({
			scopeUri: scope,
			section: 'docker',
		})) as DockerConfigSettings),
	};
	return editorConfig['docker.environment'];
}
