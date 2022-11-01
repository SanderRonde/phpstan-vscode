import type { PHPStanError } from '../../../../shared/notificationChannels';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { PHPStanCheck, ProgressListener } from './check';
import { EXTENSION_ID } from '../../../../shared/constants';
import { normalizePath } from '../../../../shared/util';
import { ConfigurationManager } from './configManager';
import { Disposable } from 'vscode-languageserver';
import type { CheckConfig } from './configManager';
import { OutputParser } from './outputParser';
import { executeCommand } from '../commands';
import type { ClassConfig } from './manager';
import { getConfiguration } from '../config';
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

	private _kill(proc: ChildProcessWithoutNullStreams): void {
		let killed = false;
		proc.once('exit', () => {
			killed = true;
		});
		// Give it 2 seconds to exit gracefully
		proc.kill('SIGINT');
		setTimeout(() => {
			// Then less gracefully
			if (killed) {
				return;
			}
			proc.kill('SIGTERM');
			setTimeout(() => {
				if (killed) {
					return;
				}
				// Then we force it
				proc.kill('SIGKILL');
			}, 2000);
		}, 2000);
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
			Disposable.create(() => !phpstan.killed && this._kill(phpstan))
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

	private async _showIgnoredErrorRegexWarning(
		ignoredError: string
	): Promise<void> {
		const OPEN_SETTINGS = 'Fix in settings';
		const choice = await this._config.connection.window.showErrorMessage(
			`To-ignore error "${ignoredError}" is not a valid regular expression`,
			{
				title: OPEN_SETTINGS,
			},
			{
				title: 'Close',
			}
		);
		if (choice?.title === OPEN_SETTINGS) {
			await executeCommand(
				this._config.connection,
				'workbench.action.openSettings',
				'phpstan.ignoreErrors'
			);
		}
	}

	private _filterIgnoredErrors(
		errors: string[],
		ignoredErrors: string[]
	): string[] {
		for (const ignoreError of ignoredErrors) {
			const regExp = (() => {
				try {
					return new RegExp(ignoreError);
				} catch (e) {
					void this._showIgnoredErrorRegexWarning(ignoreError);
					return null;
				}
			})();
			if (!regExp) {
				continue;
			}

			errors = errors.filter((error) => !regExp.test(error));
		}
		return errors;
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

		const getFilteredErr = async (): Promise<string> => {
			const config = await getConfiguration(
				this._config.connection,
				this._config.getWorkspaceFolder
			);
			const errLines = getErr()
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line.length);
			return this._filterIgnoredErrors(errLines, config.ignoreErrors)
				.map((line) => line.trim())
				.join('\n');
		};

		const getLogData = async (): Promise<string[]> => [
			' filteredErr=' + (await getFilteredErr()),
			' rawErr=' + getErr(),
			' data=' + getData(),
		];

		const onError = async (extraData: string[] = []): Promise<void> => {
			// On error
			void log(
				this._config.connection,
				checkPrefix(check),
				'PHPStan process exited with error',
				...(await getLogData()),
				...extraData
			);
			showError(
				this._config.connection,
				'PHPStan: process exited with error, see log for details'
			);
		};

		return await new Promise<ReturnResult<string>>((resolve) => {
			phpstan.on('error', (e) => {
				void onError([' errMsg=' + e.message]);
				resolve(ReturnResult.error());
			});
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			phpstan.on('exit', async () => {
				// On exit
				if (this._cancelled) {
					resolve(ReturnResult.canceled());
					return;
				}

				if (await getFilteredErr()) {
					await onError();
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
				[doc.uri]:
					new OutputParser(output).parse()[normalizePath(filePath)] ??
					[],
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
			const parsed = new OutputParser(output).parse();

			// Turn raw fs paths into URIs
			const normalized: Record<string, PHPStanError[]> = {};
			for (const filePath in parsed) {
				normalized[
					URI.from({
						scheme: 'file',
						path: filePath,
					}).toString()
				] = parsed[filePath];
			}
			return normalized;
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
			this._kill(this._process);
		}
		this._disposables = [];
	}
}
