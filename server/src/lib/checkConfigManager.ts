import { getDockerEnvironment, getEditorConfiguration } from './editorConfig';
import { docker, getConfigFile, getPathMapper } from '../../../shared/util';
import type { ConfigResolver } from './configResolver';
import { showErrorOnce } from './errorUtil';
import type { ClassConfig } from './types';
import type { URI } from 'vscode-uri';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CheckConfig {
	cwd: string;
	configFile: string;
	workspaceRoot: string | undefined;
	remoteConfigFile: string | null;
	getBinCommand: (args: string[]) => string[];
	args: string[];
	memoryLimit: string;
	tmpDir: string | undefined;
	operation: 'analyse';
}

export class ConfigurationManager {
	public static escapeFilePath(filePath: string): string {
		if (os.platform() !== 'win32') {
			return filePath;
		}
		if (filePath.indexOf(' ') !== -1) {
			filePath = '"' + filePath + '"';
		}
		return filePath;
	}

	public static async applyPathMapping(
		classConfig: ClassConfig,
		filePath: string,
		workspaceRoot: string | undefined
	): Promise<string> {
		const paths = (await getEditorConfiguration(classConfig)).paths;
		return getPathMapper(paths, workspaceRoot)(filePath);
	}

	private static async _fileIfExists(
		classConfig: ClassConfig,
		filePath: string,
		isDir: boolean
	): Promise<string | null> {
		const dockerContainerName = (await getEditorConfiguration(classConfig))
			.dockerContainerName;
		if (dockerContainerName) {
			const exists = (
				await docker(
					[
						'exec',
						dockerContainerName,
						'sh',
						'-c',
						`[ -${isDir ? 'd' : 'f'} ${filePath} ]`,
					],
					await getDockerEnvironment(classConfig)
				)
			).success;
			return exists ? filePath : null;
		}

		return this._localFileIfExists(filePath);
	}

	private static async _localFileIfExists(
		filePath: string
	): Promise<string | null> {
		try {
			await fs.access(filePath, constants.R_OK);
			return filePath;
		} catch (e) {
			return null;
		}
	}

	private static _getAbsolutePath(
		filePath: string | null,
		cwd?: string
	): string | null {
		if (!filePath) {
			return null;
		}

		if (path.isAbsolute(filePath)) {
			return filePath;
		}
		if (!cwd) {
			return null;
		}
		return path.join(cwd, filePath);
	}

	private static async _getConfigFile(
		classConfig: ClassConfig,
		configResolver: ConfigResolver,
		cwd: string | undefined,
		currentFile: URI | null
	): Promise<string | null> {
		const extensionConfig = await getEditorConfiguration(classConfig);

		// Try to auto-resolve
		const configFile = await configResolver.resolveConfig(currentFile);
		if (configFile) {
			return configFile.uri.fsPath;
		}

		const absoluteConfigPath = await getConfigFile(
			extensionConfig.configFile,
			cwd
		);
		if (!absoluteConfigPath) {
			// Config file was set but not found
			if (extensionConfig.configFile) {
				showErrorOnce(
					classConfig.connection,
					`PHPStan: failed to find config file in "${extensionConfig.configFile}"`
				);
			}
		}

		return absoluteConfigPath;
	}

	public static async getCwd(
		classConfig: ClassConfig,
		allowFail: boolean
	): Promise<string | null> {
		const workspaceRoot = (await classConfig.workspaceFolders.get())
			?.default;
		const extensionConfig = await getEditorConfiguration(classConfig);
		const cwd =
			this._getAbsolutePath(
				extensionConfig.rootDir,
				workspaceRoot?.fsPath ?? undefined
			) || workspaceRoot?.fsPath;

		if (!cwd) {
			if (!allowFail) {
				showErrorOnce(
					classConfig.connection,
					'PHPStan: failed to get CWD',
					'workspaceRoot=',
					workspaceRoot?.fsPath ?? 'undefined'
				);
			}
			return null;
		}

		if (!(await this._localFileIfExists(cwd))) {
			if (!allowFail) {
				showErrorOnce(
					classConfig.connection,
					`PHPStan: rootDir "${cwd}" does not exist`
				);
			}
			return null;
		}

		return cwd;
	}

	public static async getBinComand(
		classConfig: ClassConfig,
		cwd: string | undefined,
		workspaceRoot: string | undefined
	): Promise<
		| {
				success: true;
				getBinCommand: (args: string[]) => string[];
		  }
		| {
				success: false;
				error: string;
		  }
	> {
		const extensionConfig = await getEditorConfiguration(classConfig);
		const providedBinPath = path.isAbsolute(extensionConfig.binPath)
			? extensionConfig.binPath
			: this._getAbsolutePath(extensionConfig.binPath, cwd);

		let binPath = providedBinPath;
		if (cwd) {
			binPath ??= path.join(cwd, 'vendor/bin/phpstan');
		}
		if (binPath) {
			if (binPath.startsWith('~')) {
				binPath = `${process.env.HOME ?? '~'}${binPath.slice(1)}`;
			}
			binPath = await this.applyPathMapping(
				classConfig,
				binPath,
				workspaceRoot
			);
		}

		const binCommand = extensionConfig.binCommand;
		if (
			(!binCommand || binCommand.length === 0) &&
			(!binPath ||
				!(await this._fileIfExists(classConfig, binPath, false)))
		) {
			// Command binary does not exist
			return {
				success: false,
				error: `Failed to find binary${binPath ? ` at "${binPath}"` : ''}`,
			};
		}

		if (binCommand?.length) {
			return {
				success: true,
				getBinCommand: (args) => [...binCommand, ...args],
			};
		}

		if (!binPath) {
			return {
				success: false,
				error: 'Failed to find binary',
			};
		}

		if (extensionConfig.dockerContainerName) {
			return {
				success: true,
				getBinCommand: (args) => [
					'docker',
					'exec',
					extensionConfig.dockerContainerName,
					'sh',
					'-c',
					`${ConfigurationManager.escapeFilePath(binPath)} ${args.join(' ')} & echo docker-pid:$! && wait $!`,
				],
			};
		}

		return {
			success: true,
			getBinCommand: (args) => [
				ConfigurationManager.escapeFilePath(binPath),
				...args,
			],
		};
	}

	public static async collectConfiguration(
		classConfig: ClassConfig,
		configResolver: ConfigResolver,
		operation: 'analyse',
		currentFile: URI | null,
		onError: null | ((error: string) => void)
	): Promise<CheckConfig | null> {
		// Settings
		const extensionConfig = await getEditorConfiguration(classConfig);

		const workspaceFolders = await classConfig.workspaceFolders.get();
		let cwd: string | undefined;
		if (workspaceFolders?.default) {
			cwd = (await this.getCwd(classConfig, false)) ?? undefined;
			if (!cwd) {
				return null;
			}
		} else {
			// Multiple workspaces. This means config files need to be absolute and we can
			// use that to infer cwd.
		}

		const configFile = await this._getConfigFile(
			classConfig,
			configResolver,
			cwd,
			currentFile
		);
		if (!configFile) {
			if (onError) {
				onError('Failed to find config file');
			}
			return null;
		}
		const workspaceRoot =
			workspaceFolders?.getForPath(configFile)?.fsPath ??
			workspaceFolders?.default?.fsPath;

		if (!cwd) {
			cwd =
				this._getAbsolutePath(extensionConfig.rootDir, workspaceRoot) ||
				workspaceRoot;
		}

		if (!cwd) {
			showErrorOnce(classConfig.connection, 'PHPStan: failed to get CWD');
			return null;
		}

		const result = await this.getBinComand(classConfig, cwd, workspaceRoot);
		if (!result.success) {
			if (onError) {
				onError(result.error);
			} else {
				showErrorOnce(
					classConfig.connection,
					`PHPStan: ${result.error}`
				);
			}
			return null;
		}

		const tmpDir: string | undefined = extensionConfig.tmpDir;

		return {
			cwd,
			configFile,
			workspaceRoot,
			remoteConfigFile: configFile
				? await ConfigurationManager.applyPathMapping(
						classConfig,
						configFile,
						workspaceRoot
					)
				: null,
			args: extensionConfig.options ?? [],
			memoryLimit: extensionConfig.memoryLimit,
			tmpDir: tmpDir,
			getBinCommand: result.getBinCommand,
			operation,
		};
	}

	public static async getArgs(
		classConfig: ClassConfig,
		checkConfig: CheckConfig,
		progress: boolean
	): Promise<string[]> {
		const args: string[] = [checkConfig.operation];
		if (checkConfig.remoteConfigFile) {
			args.push(
				...[
					'-c',
					ConfigurationManager.escapeFilePath(
						checkConfig.remoteConfigFile
					),
				]
			);
		} else if (checkConfig.configFile) {
			args.push('-c', checkConfig.configFile);
		}

		if (checkConfig.operation === 'analyse') {
			args.push(
				'--error-format=json',
				'--no-interaction',
				`--memory-limit=${checkConfig.memoryLimit}`
			);
			if (!progress) {
				args.push('--no-progress');
			}
			args.push(...checkConfig.args);
		}
		return checkConfig.getBinCommand(
			await classConfig.hooks.provider.transformArgs(
				checkConfig,
				classConfig,
				args,
				checkConfig.operation
			)
		);
	}
}
