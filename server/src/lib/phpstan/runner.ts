import type { PHPStanError } from '../../../../shared/notificationChannels';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { PHPStanCheck, ProgressListener } from './check';
import { EXTENSION_ID } from '../../../../shared/constants';
import { ConfigurationManager } from './configManager';
import { Disposable } from 'vscode-languageserver';
import type { CheckConfig } from './configManager';
import { OutputParser } from './outputParser';
import { executeCommand } from '../commands';
import type { ClassConfig } from './manager';
import { checkPrefix, log } from '../log';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { spawn } from 'child_process';
import { URI } from 'vscode-uri';
import * as os from 'os';

export type PartialDocument = Pick<
	TextDocument,
	'uri' | 'getText' | 'languageId'
>;

export class PHPStanRunner implements Disposable {
	private _cancelled: boolean = false;
	private _process: ChildProcessWithoutNullStreams | null = null;
	private _disposables: Disposable[] = [];
	private _configManager: ConfigurationManager = new ConfigurationManager(
		this._config
	);

	public constructor(private readonly _config: ClassConfig) {}

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
		{
			doc,
			filePath,
			progress,
		}: {
			filePath?: string;
			doc?: PartialDocument;
			progress?: boolean;
		}
	): Promise<string[]> {
		const args = [...config.initialArgs, 'analyse'];
		if (config.remoteConfigFile) {
			args.push(...['-c', this._escapeFilePath(config.remoteConfigFile)]);
		} else if (config.configFile) {
			args.push('-c', config.configFile);
		}

		args.push(
			'--error-format=raw',
			'--no-interaction',
			`--memory-limit=${config.memoryLimit}`
		);
		if (!progress) {
			args.push('--no-progress');
		}
		args.push(...config.args);
		if (filePath) {
			args.push(this._escapeFilePath(filePath));
		}

		if (filePath && doc) {
			return await this._config.hooks.provider.transformArgs(
				config,
				args,
				doc.uri,
				filePath,
				this._disposables
			);
		}
		return args;
	}

	private async _spawnProcess(
		config: CheckConfig,
		check: PHPStanCheck,
		args: string[]
	): Promise<ChildProcessWithoutNullStreams> {
		const binStr = config.binCmd
			? config.binCmd
			: this._escapeFilePath(config.binPath!);
		await log(
			this._config.connection,
			checkPrefix(check),
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
		channel: 'stdout' | 'stderr',
		onProgress?: ProgressListener
	): () => string {
		let data: string = '';
		proc[channel].on('data', (dataPart: string | Buffer) => {
			const str = dataPart.toString('utf-8');
			const progressMatch = onProgress
				? [...str.matchAll(/(\d+)\/(\d+)\s+\[.*?\]\s+(\d+)%/g)]
				: [];
			if (progressMatch.length) {
				const [, done, total, percentage] =
					progressMatch[progressMatch.length - 1];
				onProgress!({
					done: parseInt(done, 10),
					total: parseInt(total, 10),
					percentage: parseInt(percentage, 10),
				});
				return;
			}

			// Ignore control characters in output
			// eslint-disable-next-line no-control-regex
			const ansiRegex = /\x1b\[(\d+)/g;
			if (ansiRegex.test(str)) {
				return;
			}
			data += str;
		});
		return () => data;
	}

	private async _getProcessOutput(
		config: CheckConfig,
		check: PHPStanCheck,
		args: string[],
		{
			doc,
			onProgress,
		}: {
			doc?: PartialDocument;
			onProgress?: ProgressListener;
		}
	): Promise<ReturnResult<string>> {
		const phpstan = await this._spawnProcess(config, check, args);
		this._process = phpstan;

		const getData = this._createOutputCapturer(
			phpstan,
			'stdout',
			onProgress
		);
		// Not sure why progress is pumped into stderr but oh well
		const getErr = this._createOutputCapturer(
			phpstan,
			'stderr',
			onProgress
		);

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
				checkPrefix(check),
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

				if (getErr().trim()) {
					onError();
					resolve(ReturnResult.error());
					return;
				}

				void log(
					this._config.connection,
					checkPrefix(check),
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

				if (doc) {
					await this._config.hooks.provider.onCheckDone(doc.uri);
				}

				resolve(ReturnResult.success(getData()));
			});
		});
	}

	private async _check(
		doc: PartialDocument,
		check: PHPStanCheck,
		onProgress?: ProgressListener
	): Promise<ReturnResult<Record<string, PHPStanError[]>>> {
		// Get config
		const config = await this._configManager.collectConfiguration();
		if (!config) {
			return ReturnResult.error();
		}
		if (this._cancelled) {
			return ReturnResult.canceled();
		}

		// Get file
		const filePath = await ConfigurationManager.applyPathMapping(
			this._config,
			URI.parse(doc.uri).fsPath
		);
		if (this._cancelled) {
			return ReturnResult.canceled();
		}

		const args = await this._getArgs(config, {
			filePath: filePath,
			doc,
			progress: !!onProgress,
		});
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		const result = await this._getProcessOutput(config, check, args, {
			doc,
			onProgress,
		});

		return result.chain((output) => {
			return {
				[filePath]: new OutputParser(output).parse()[filePath] ?? [],
			};
		});
	}

	private async _checkProject(
		check: PHPStanCheck,
		onProgress: ProgressListener
	): Promise<ReturnResult<Record<string, PHPStanError[]>>> {
		// Get config
		const config = await this._configManager.collectConfiguration();
		if (!config) {
			return ReturnResult.error();
		}
		if (this._cancelled) {
			return ReturnResult.canceled();
		}

		// Get args
		const args = await this._getArgs(config, {
			progress: true,
		});
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		const result = await this._getProcessOutput(config, check, args, {
			onProgress,
		});

		return result.chain((output) => {
			return new OutputParser(output).parse();
		});
	}

	public async check(
		file: PartialDocument,
		check: PHPStanCheck,
		onProgress?: ProgressListener
	): Promise<ReturnResult<Record<string, PHPStanError[]>>> {
		const errors = await this._check(file, check, onProgress);
		this.dispose();
		return errors;
	}

	public async checkProject(
		check: PHPStanCheck,
		onProgress: ProgressListener
	): Promise<ReturnResult<Record<string, PHPStanError[]>>> {
		const errors = await this._checkProject(check, onProgress);
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
