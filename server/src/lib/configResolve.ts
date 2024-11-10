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
	private _configs: Config[] | undefined;

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
								await this.resolveConfig(URI.parse(params.uri))
							)?.uri.toString() ?? null,
					};
				}
			)
		);
	}

	private async _findConfigs(): Promise<Config[]> {
		if (!this._configs) {
			const editorConfig = await getEditorConfiguration(
				this._classConfig
			);
			const configFilePaths = editorConfig.configFile
				.split(',')
				.map((configFile) => path.basename(configFile.trim()));
			const findFilesResult =
				await this._classConfig.connection.sendRequest(
					findFilesRequest,
					{ pattern: `**/{${configFilePaths.join(',')}}` }
				);
			const fileURIs = findFilesResult.files.map((file) =>
				URI.parse(file)
			);
			this._configs = await Promise.all(
				fileURIs.map(async (fileURI) => ({
					uri: fileURI,
					file: await ParsedConfigFile.from(fileURI.fsPath),
				}))
			);
		}
		return this._configs;
	}

	public async resolveConfig(filePath: URI): Promise<Config | null> {
		const configs = await this._findConfigs();
		for (const config of configs) {
			if (config.file.isInPaths(filePath.fsPath)) {
				return config;
			}
		}
		return null;
	}

	public dispose(): void {
		this._disposables.forEach((d) => d.dispose());
	}
}
