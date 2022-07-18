import { showErrorOnce } from '../errorUtil';
import { getConfiguration } from '../config';
import type { ClassConfig } from './manager';
import * as fs from 'fs/promises';
import { constants } from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CheckConfig {
	cwd: string;
	configFile: string | null;
	remoteConfigFile: string | null;
	binCmd: string | null;
	binPath: string | null;
	initialArgs: string[];
	args: string[];
	memoryLimit: string;
}

export class ConfigurationManager {
	private __config: CheckConfig | null = null;

	public constructor(private readonly _config: ClassConfig) {}

	public static async applyPathMapping(
		config: ClassConfig,
		filePath: string
	): Promise<string> {
		const pathMapping =
			(await getConfiguration(config.connection)).phpstan.paths ?? {};
		if (Object.keys(pathMapping).length === 0) {
			return filePath;
		}
		const expandedFilePath = filePath.replace(/^~/, os.homedir());
		for (const [from, to] of Object.entries(pathMapping)) {
			const expandedFromPath = from.replace(/^~/, os.homedir());
			if (expandedFilePath.startsWith(expandedFromPath)) {
				return expandedFilePath.replace(
					expandedFromPath,
					to.replace(/^~/, os.homedir())
				);
			}
		}
		return filePath;
	}

	private async _fileIfExists(filePath: string): Promise<string | null> {
		try {
			await fs.access(filePath, constants.R_OK);
			return filePath;
		} catch (e) {
			return null;
		}
	}

	private _getAbsolutePath(
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

	private async _getCwd(): Promise<string | null> {
		const workspaceRoot = this._config.getWorkspaceFolder();
		const extensionConfig = await getConfiguration(this._config.connection);
		const cwd =
			this._getAbsolutePath(
				extensionConfig.phpstan.rootDir,
				workspaceRoot ?? undefined
			) || workspaceRoot;

		if (cwd && !(await this._fileIfExists(cwd))) {
			await showErrorOnce(
				this._config.connection,
				`PHPStan: rootDir "${cwd}" does not exist`
			);
			return null;
		}

		if (!cwd) {
			await showErrorOnce(
				this._config.connection,
				'PHPStan: failed to get CWD',
				'workspaceRoot=',
				workspaceRoot ?? 'undefined'
			);
			return null;
		}

		return cwd;
	}

	private async _getBinConfig(
		cwd: string
	): Promise<Pick<CheckConfig, 'initialArgs' | 'binPath' | 'binCmd'> | null> {
		const extensionConfig = await getConfiguration(this._config.connection);
		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.phpstan.binPath,
			cwd
		);
		const binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');
		const binCommand = extensionConfig.phpstan.binCommand;

		if (!binPath && (!binCommand || binCommand.length === 0)) {
			// No binary and no command
			await showErrorOnce(
				this._config.connection,
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
				this._config.connection,
				`PHPStan: failed to find binary at "${binPath}"`
			);
			return null;
		}

		if (binCommand?.length) {
			const [binCmd, ...initialArgs] = binCommand;
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

	private async _getConfigFile(cwd: string): Promise<string | null> {
		const extensionConfig = await getConfiguration(this._config.connection);
		const defaultConfigFile = this._getAbsolutePath(
			extensionConfig.phpstan.configFile,
			cwd
		);
		if (
			defaultConfigFile &&
			!(await this._fileIfExists(defaultConfigFile))
		) {
			await showErrorOnce(
				this._config.connection,
				`PHPStan: failed to find config file at "${defaultConfigFile}"`
			);
			return null;
		}

		return defaultConfigFile;
	}

	public async collectConfiguration(): Promise<CheckConfig | null> {
		if (this.__config) {
			return this.__config;
		}
		// Settings
		const extensionConfig = await getConfiguration(this._config.connection);

		const cwd = await this._getCwd();
		if (!cwd) {
			return null;
		}
		const binConfig = await this._getBinConfig(cwd);
		if (!binConfig) {
			return null;
		}
		const configFile = await this._getConfigFile(cwd);
		if (!configFile) {
			return null;
		}

		const config: CheckConfig = {
			cwd,
			configFile,
			remoteConfigFile: configFile
				? await ConfigurationManager.applyPathMapping(
						this._config,
						configFile
				  )
				: null,
			args: extensionConfig.phpstan.options ?? [],
			memoryLimit: extensionConfig.phpstan.memoryLimit,
			...binConfig,
		};
		this.__config = config;
		return config;
	}
}
