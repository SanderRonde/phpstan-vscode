import type { ConfigResolveRequestType } from '../../../shared/requestChannels';
import { configResolveRequest, findFilesRequest } from './requestChannels';
import type { Disposable } from 'vscode-languageserver';
import { ParsedConfigFile } from '../../../shared/neon';
import { getEditorConfiguration } from './editorConfig';
import type { ClassConfig } from './types';
import { URI } from 'vscode-uri';
import path from 'path';

interface Config {
	uri: URI;
	file: ParsedConfigFile;
}

export class ConfigResolver implements Disposable {
	private readonly _disposables: Disposable[] = [];
	private _configs: Config[][] | undefined;

	public constructor(private readonly _classConfig: ClassConfig) {
		this._disposables.push(
			this._classConfig.connection.onRequest(
				configResolveRequest,
				async (
					params
				): Promise<ConfigResolveRequestType['response']> => {
					return {
						uri:
							(
								await this.resolveConfigForFile(
									URI.parse(params.uri)
								)
							)?.uri.toString() ?? null,
					};
				}
			)
		);
	}

	private async _findConfigs(): Promise<Config[][]> {
		if (!this._configs) {
			const editorConfig = await getEditorConfiguration(
				this._classConfig
			);
			const configFilePaths = editorConfig.configFile
				.split(',')
				.map((configFile) => path.basename(configFile.trim()));
			const configs: Config[][] = [];
			for (const configFilePath of configFilePaths) {
				const findFilesResult =
					await this._classConfig.connection.sendRequest(
						findFilesRequest,
						{ pattern: `**/${configFilePath}` }
					);
				if (findFilesResult.files.length === 0) {
					continue;
				}
				const fileURIs = findFilesResult.files.map((file) =>
					URI.parse(file)
				);
				configs.push(
					await Promise.all(
						fileURIs.map(async (fileURI) => ({
							uri: fileURI,
							file: await ParsedConfigFile.from(fileURI.fsPath),
						}))
					)
				);
			}
			this._configs = configs;
		}
		return this._configs;
	}

	private async getSingleConfig(): Promise<Config | null> {
		const configs = await this._findConfigs();
		if (configs.length === 0) {
			return null;
		}
		if (configs[0].length !== 1) {
			return null;
		}
		return configs[0][0];
	}

	private async resolveConfigForFile(filePath: URI): Promise<Config | null> {
		const configGroups = await this._findConfigs();
		for (const configGroup of configGroups) {
			for (const config of configGroup) {
				if (config.file.isInPaths(filePath.fsPath)) {
					return config;
				}
			}
		}
		return null;
	}

	public async resolveConfig(filePath: URI | null): Promise<Config | null> {
		if (filePath) {
			return this.resolveConfigForFile(filePath);
		}
		return this.getSingleConfig();
	}

	/**
	 * Best-effort tries to get all configs such that their
	 * included paths don't overlap.
	 */
	public async getAllConfigs(): Promise<Config[]> {
		const coveredPaths = new Set<string>();

		const allConfigs: Config[] = [];
		const configGroups = await this._findConfigs();
		for (const configGroup of configGroups) {
			for (const config of configGroup) {
				for (const relativeIncludedPath of config.file.paths) {
					const absoluteIncludedPath = path.join(
						path.dirname(config.uri.fsPath),
						relativeIncludedPath
					);
					if (coveredPaths.has(absoluteIncludedPath)) {
						continue;
					}
					coveredPaths.add(absoluteIncludedPath);
					allConfigs.push(config);
				}
			}
		}
		return allConfigs;
	}

	public dispose(): void {
		this._disposables.forEach((d) => d.dispose());
	}
}
