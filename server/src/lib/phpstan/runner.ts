import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import { EXTENSION_ID } from '../../../../shared/constants';
import type { Diagnostic } from 'vscode-languageserver';
import { ConfigurationManager } from './configManager';
import { Disposable } from 'vscode-languageserver';
import type { CheckConfig } from './configManager';
import { OutputParser } from './outputParser';
import { executeCommand } from '../commands';
import type { ClassConfig } from './manager';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { spawn } from 'child_process';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import { log } from '../log';
import * as os from 'os';

export type PartialDocument = Pick<TextDocument, 'uri' | 'getText'> & {
	dirty: boolean;
};

export class PHPStanRunner implements Disposable {
	private _cancelled: boolean = false;
	private _process: ChildProcessWithoutNullStreams | null = null;
	private _disposables: Disposable[] = [];
	private _configManager: ConfigurationManager = new ConfigurationManager(
		this._config
	);

	public constructor(private readonly _config: ClassConfig) {}

	private async _getFilePath(
		e: PartialDocument
	): Promise<ReturnResult<string>> {
		const mappedPath = await ConfigurationManager.applyPathMapping(
			this._config,
			URI.parse(e.uri).fsPath
		);

		if (e.dirty) {
			if (mappedPath !== URI.parse(e.uri).fsPath) {
				return ReturnResult.canceled();
			}
			const tmpFile = await tmp.file();
			await fs.writeFile(tmpFile.path, e.getText());
			this._disposables.push(
				Disposable.create(() => void tmpFile.cleanup())
			);
			return ReturnResult.success(tmpFile.path);
		}

		return ReturnResult.success(mappedPath);
	}

	private _escapeFilePath(filePath: string): string {
		if (os.platform() !== 'win32') {
			return filePath;
		}
		if (filePath.indexOf(' ') !== -1) {
			filePath = '"' + filePath + '"';
		}
		return filePath;
	}

	private async _getArgs(
		config: CheckConfig,
		filePath: string,
		doc: PartialDocument
	): Promise<string[]> {
		const args = [...config.initialArgs, 'analyse'];
		if (config.remoteConfigFile) {
			args.push(...['-c', this._escapeFilePath(config.remoteConfigFile)]);
		}

		args.push(
			'--error-format=raw',
			'--no-progress',
			'--no-interaction',
			`--memory-limit=${config.memoryLimit}`,
			...config.args,
			this._escapeFilePath(filePath)
		);

		return await this._config.hooks.hoverProvider.transformArgs(
			config,
			args,
			doc.uri,
			filePath,
			this._disposables
		);
	}

	private async _spawnProcess(
		config: CheckConfig,
		args: string[]
	): Promise<ChildProcessWithoutNullStreams> {
		const binStr = config.binCmd
			? config.binCmd
			: this._escapeFilePath(config.binPath!);
		await log(
			this._config.connection,
			'Spawning PHPStan with the following configuration: ',
			JSON.stringify({
				binCmd: binStr,
				args,
			})
		);
		const phpstan = spawn(binStr, args, {
			shell: process.platform === 'win32',
			cwd: config.cwd,
			windowsVerbatimArguments: true,
		});
		this._disposables.push(
			Disposable.create(() => !phpstan.killed && phpstan.kill())
		);
		return phpstan;
	}

	private _createOutputCapturer(
		proc: ChildProcessWithoutNullStreams,
		channel: 'stdout' | 'stderr'
	): () => string {
		let data: string = '';
		proc[channel].on('data', (dataPart: string | Buffer) => {
			data += dataPart.toString('utf-8');
		});
		return () => data;
	}

	private async _getProcessOutput(
		config: CheckConfig,
		args: string[],
		doc: PartialDocument
	): Promise<ReturnResult<string>> {
		const phpstan = await this._spawnProcess(config, args);
		this._process = phpstan;

		const getData = this._createOutputCapturer(phpstan, 'stdout');
		const getErr = this._createOutputCapturer(phpstan, 'stderr');

		const getLogData = (): string[] => [
			' err=',
			getErr(),
			' data=',
			getData(),
		];

		const onError = (extraData: string[] = []): void => {
			// On error
			void log(
				this._config.connection,
				'PHPStan process exited with error',
				...getLogData(),
				...extraData
			);
			showError(
				this._config.connection,
				'PHPStan: process exited with error, see log for details'
			);
		};

		return await new Promise<ReturnResult<string>>((resolve) => {
			phpstan.on('error', (e) => {
				onError([' errMsg=', e.message]);
				resolve(ReturnResult.error());
			});
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			phpstan.on('exit', async () => {
				// On exit
				if (this._cancelled) {
					resolve(ReturnResult.canceled());
					return;
				}

				if (getErr()) {
					onError();
					resolve(ReturnResult.error());
					return;
				}

				void log(
					this._config.connection,
					'PHPStan process exited succesfully'
				);

				// Check for warning
				if (getData().includes('Allowed memory size of')) {
					showError(
						this._config.connection,
						'PHPStan: Out of memory, try adding more memory by setting the phpstan.memoryLimit option',
						[
							{
								title: 'Go to option',
								callback: () => {
									void executeCommand(
										this._config.connection,
										'workbench.actin.openSettings',
										`@ext:${EXTENSION_ID} memoryLimit`
									);
								},
							},
						]
					);
					resolve(ReturnResult.error());
					return;
				}

				await this._config.hooks.hoverProvider.onCheckDone(doc.uri);

				resolve(ReturnResult.success(getData()));
			});
		});
	}

	private async _check(
		doc: PartialDocument
	): Promise<ReturnResult<Diagnostic[]>> {
		// Get config
		const config = await this._configManager.collectConfiguration();
		if (!config) {
			return ReturnResult.error();
		}
		if (this._cancelled) {
			return ReturnResult.canceled();
		}

		// Get file
		const filePath = await this._getFilePath(doc);
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		if (!filePath.success()) {
			return filePath.cast();
		}

		const args = await this._getArgs(config, filePath.value, doc);
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		const result = await this._getProcessOutput(config, args, doc);

		return result.chain((output) => {
			return new OutputParser(output, filePath.value, doc).parse();
		});
	}

	public async check(
		file: PartialDocument
	): Promise<ReturnResult<Diagnostic[]>> {
		const errors = await this._check(file);
		this.dispose();
		return errors;
	}

	public dispose(): void {
		this._cancelled = true;
		this._disposables.forEach((d) => d.dispose());
		if (this._process && !this._process.killed) {
			this._process.kill();
		}
		this._disposables = [];
	}
}
