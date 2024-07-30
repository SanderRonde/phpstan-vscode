import { getEditorConfiguration } from './editorConfig';
import { showErrorOnce } from './errorUtil';
import type { ClassConfig } from './types';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CheckConfig {
	cwd: string;
	configFile: string | null;
	remoteConfigFile: string | null;
	binCmd: string | null;
	binStr: string;
	binPath: string | null;
	initialArgs: string[];
	args: string[];
	memoryLimit: string;
	tmpDir: string | undefined;
}

export class ConfigurationManager {
	public static async applyPathMapping(
		classConfig: ClassConfig,
		filePath: string
	): Promise<string> {
		return (await this.getPathMapper(classConfig))(filePath);
	}

	public static escapeFilePath(filePath: string): string {
		if (os.platform() !== 'win32') {
			return filePath;
		}
		if (filePath.indexOf(' ') !== -1) {
			filePath = '"' + filePath + '"';
		}
		return filePath;
	}

	public static async getPathMapper(
		classConfig: ClassConfig
	): Promise<(filePath: string, inverse?: boolean) => string> {
		const pathMapping =
			(await getEditorConfiguration(classConfig)).paths ?? {};

		return (filePath: string, inverse: boolean = false) => {
			if (Object.keys(pathMapping).length === 0) {
				return filePath;
			}
			const expandedFilePath = filePath.replace(/^~/, os.homedir());
			for (const [fromPath, toPath] of Object.entries(pathMapping)) {
				const [from, to] = inverse
					? [toPath, fromPath]
					: [fromPath, toPath];
				const expandedFromPath = from.replace(/^~/, os.homedir());
				if (expandedFilePath.startsWith(expandedFromPath)) {
					return expandedFilePath.replace(
						expandedFromPath,
						to.replace(/^~/, os.homedir())
					);
				}
			}
			return filePath;
		};
	}

	private static async _fileIfExists(
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
		cwd: string
	): Promise<string | null> {
		const extensionConfig = await getEditorConfiguration(classConfig);
		const absoluteConfigPaths = extensionConfig.configFile
			? extensionConfig.configFile
					.split(',')
					.map((c) => c.trim())
					.map((c) => this._getAbsolutePath(c, cwd))
			: [];
		for (const absoluteConfigPath of absoluteConfigPaths) {
			if (
				absoluteConfigPath &&
				(await this._fileIfExists(absoluteConfigPath))
			) {
				return absoluteConfigPath;
			}
		}

		// Config file was set but not found
		if (extensionConfig.configFile) {
			await showErrorOnce(
				classConfig.connection,
				`PHPStan: failed to find config file in "${extensionConfig.configFile}"`
			);
		}

		return null;
	}

	public static async getCwd(
		classConfig: ClassConfig
	): Promise<string | null> {
		const workspaceRoot = (await classConfig.workspaceFolders.get())
			?.default;
		const extensionConfig = await getEditorConfiguration(classConfig);
		const cwd =
			this._getAbsolutePath(
				extensionConfig.rootDir,
				workspaceRoot?.fsPath ?? undefined
			) || workspaceRoot?.fsPath;

		if (cwd && !(await this._fileIfExists(cwd))) {
			await showErrorOnce(
				classConfig.connection,
				`PHPStan: rootDir "${cwd}" does not exist`
			);
			return null;
		}

		if (!cwd) {
			await showErrorOnce(
				classConfig.connection,
				'PHPStan: failed to get CWD',
				'workspaceRoot=',
				workspaceRoot?.fsPath ?? 'undefined'
			);
			return null;
		}

		return cwd;
	}

	public static async getBinConfig(
		classConfig: ClassConfig,
		cwd: string
	): Promise<Pick<CheckConfig, 'initialArgs' | 'binPath' | 'binCmd'> | null> {
		const extensionConfig = await getEditorConfiguration(classConfig);
		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.binPath,
			cwd
		);
		let binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');
		if (binPath.startsWith('~')) {
			binPath = `${process.env.HOME ?? '~'}${binPath.slice(1)}`;
		}
		const binCommand = extensionConfig.binCommand;

		if (!binPath && (!binCommand || binCommand.length === 0)) {
			// No binary and no command
			await showErrorOnce(
				classConfig.connection,
				'PHPStan: failed to find binary path'
			);
			return null;
		}

		if (
			(!binCommand || binCommand.length === 0) &&
			!(await this._fileIfExists(binPath))
		) {
			// Command binary does not exist
			await showErrorOnce(
				classConfig.connection,
				`PHPStan: failed to find binary at "${binPath}"`
			);
			return null;
		}

		if (binCommand?.length) {
			// eslint-disable-next-line prefer-const
			let [binCmd, ...initialArgs] = binCommand;
			if (binCmd.startsWith('~')) {
				binCmd = `${process.env.HOME ?? '~'}${binCmd.slice(1)}`;
			}
			return {
				binCmd,
				binPath: null,
				initialArgs,
			};
		}
		return {
			binCmd: null,
			binPath,
			initialArgs: [],
		};
	}

	public static async collectConfiguration(
		classConfig: ClassConfig
	): Promise<CheckConfig | null> {
		// Settings
		const extensionConfig = await getEditorConfiguration(classConfig);

		const cwd = await this.getCwd(classConfig);
		if (!cwd) {
			return null;
		}
		const binConfig = await this.getBinConfig(classConfig, cwd);
		if (!binConfig) {
			return null;
		}
		const configFile = await this._getConfigFile(classConfig, cwd);
		if (!configFile) {
			return null;
		}

		const tmpDir: string | undefined = extensionConfig.tmpDir;

		return {
			cwd,
			configFile,
			remoteConfigFile: configFile
				? await ConfigurationManager.applyPathMapping(
						classConfig,
						configFile
					)
				: null,
			args: extensionConfig.options ?? [],
			memoryLimit: extensionConfig.memoryLimit,
			binStr: binConfig.binCmd
				? binConfig.binCmd
				: ConfigurationManager.escapeFilePath(binConfig.binPath!),
			tmpDir: tmpDir,
			...binConfig,
		};
	}

	public static async getArgs(
		classConfig: ClassConfig,
		checkConfig: CheckConfig,
		progress: boolean
	): Promise<string[]> {
		const args = [...checkConfig.initialArgs, 'analyse'];
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

		args.push(
			'--error-format=json',
			'--no-interaction',
			`--memory-limit=${checkConfig.memoryLimit}`
		);
		if (!progress) {
			args.push('--no-progress');
		}
		args.push(...checkConfig.args);
		return await classConfig.hooks.provider.transformArgs(checkConfig, [
			checkConfig.binStr,
			...args,
		]);
	}
}
