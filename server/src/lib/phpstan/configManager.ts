import type { Disposable } from 'vscode-languageserver';
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
	binStr: string;
	binPath: string | null;
	initialArgs: string[];
	args: string[];
	memoryLimit: string;
}

export class ConfigurationManager implements Disposable {
	private _disposables: Disposable[] = [];
	private __config: CheckConfig | null = null;

	public constructor(private readonly _config: ClassConfig) {}

	public static async applyPathMapping(
		config: ClassConfig,
		filePath: string
	): Promise<string> {
		const pathMapper = await this.getPathMapper(config);
		return pathMapper(filePath);
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
		config: ClassConfig
	): Promise<(filePath: string, inverse?: boolean) => string> {
		const pathMapping =
			(await getConfiguration(config.connection, config.workspaceFolders))
				.paths ?? {};

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

	private async _getConfigFile(cwd: string): Promise<string | null> {
		const extensionConfig = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
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
				this._config.connection,
				`PHPStan: failed to find config file in "${extensionConfig.configFile}"`
			);
		}

		return null;
	}

	public async getCwd(): Promise<string | null> {
		const workspaceRoot = (await this._config.workspaceFolders.get())
			?.default;
		const extensionConfig = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		const cwd =
			this._getAbsolutePath(
				extensionConfig.rootDir,
				workspaceRoot?.fsPath ?? undefined
			) || workspaceRoot?.fsPath;

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
				workspaceRoot?.fsPath ?? 'undefined'
			);
			return null;
		}

		return cwd;
	}

	public async getBinConfig(
		cwd: string
	): Promise<Pick<CheckConfig, 'initialArgs' | 'binPath' | 'binCmd'> | null> {
		const extensionConfig = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.binPath,
			cwd
		);
		const binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');
		const binCommand = extensionConfig.binCommand;

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

	public async collectConfiguration(): Promise<CheckConfig | null> {
		if (this.__config) {
			return this.__config;
		}
		// Settings
		const extensionConfig = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);

		const cwd = await this.getCwd();
		if (!cwd) {
			return null;
		}
		const binConfig = await this.getBinConfig(cwd);
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
			args: extensionConfig.options ?? [],
			memoryLimit: extensionConfig.memoryLimit,
			binStr: binConfig.binCmd
				? binConfig.binCmd
				: ConfigurationManager.escapeFilePath(binConfig.binPath!),
			...binConfig,
		};
		this.__config = config;
		return config;
	}

	public async getArgs(
		config: CheckConfig,
		progress: boolean = true
	): Promise<string[]> {
		const args = [...config.initialArgs, 'analyse'];
		if (config.remoteConfigFile) {
			args.push(
				...[
					'-c',
					ConfigurationManager.escapeFilePath(
						config.remoteConfigFile
					),
				]
			);
		} else if (config.configFile) {
			args.push('-c', config.configFile);
		}

		args.push(
			'--error-format=json',
			'--no-interaction',
			`--memory-limit=${config.memoryLimit}`
		);
		if (!progress) {
			args.push('--no-progress');
		}
		args.push(...config.args);
		return await this._config.hooks.provider.transformArgs(config, [
			config.binStr,
			...args,
		]);
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
	}
}
