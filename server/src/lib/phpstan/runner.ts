import {
	EXTENSION_ID,
	PROCESS_TIMEOUT,
	SPAWN_ARGS,
} from '../../../../shared/constants';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { PHPStanCheck, ProgressListener } from './check';
import { ConfigurationManager } from './configManager';
import type { ReportedErrors } from './outputParser';
import { Disposable } from 'vscode-languageserver';
import type { CheckConfig } from './configManager';
import { OutputParser } from './outputParser';
import { executeCommand } from '../commands';
import type { ClassConfig } from './manager';
import { getConfiguration } from '../config';
import { checkPrefix, log } from '../log';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { URI } from 'vscode-uri';
import * as os from 'os';

export type PartialDocument = Pick<
	TextDocument,
	'uri' | 'getText' | 'languageId'
>;

export interface PHPStanCheckResult {
	errors: string[];
	files: Record<
		string,
		{
			errors: number;
			messages: {
				ignorable: boolean;
				line: number;
				message: string;
			}[];
		}
	>;
	totals: {
		errors: number;
		file_errors: number;
	};
}

export class PHPStanRunner implements Disposable {
	private _cancelled: boolean = false;
	private _process: ChildProcessWithoutNullStreams | null = null;
	private _configManager: ConfigurationManager = new ConfigurationManager(
		this._config
	);
	private _disposables: Disposable[] = [this._configManager];

	public constructor(private readonly _config: ClassConfig) {}

	public static escapeFilePath(filePath: string): string {
		if (os.platform() !== 'win32') {
			return filePath;
		}
		if (filePath.indexOf(' ') !== -1) {
			filePath = '"' + filePath + '"';
		}
		return filePath;
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
		check: PHPStanCheck
	): Promise<ChildProcessWithoutNullStreams> {
		const [binStr, ...args] = await this._configManager.getArgs(config);
		await log(
			this._config.connection,
			checkPrefix(check),
			'Spawning PHPStan with the following configuration: ',
			JSON.stringify({
				binStr,
				args: args,
			})
		);
		const phpstan = await this._config.procSpawner.spawnWithRobustTimeout(
			binStr,
			args,
			PROCESS_TIMEOUT,
			{
				...SPAWN_ARGS,
				cwd: config.cwd,
			}
		);
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
		{
			onProgress,
		}: {
			onProgress?: ProgressListener;
		}
	): Promise<ReturnResult<PHPStanCheckResult>> {
		const phpstan = await this._spawnProcess(config, check);
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
				this._config.workspaceFolder
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

		return await new Promise<ReturnResult<PHPStanCheckResult>>(
			(resolve) => {
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

					// Check for warning
					if (getErr().includes('Allowed memory size of')) {
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

					await this._config.hooks.provider.onCheckDone();

					resolve(
						ReturnResult.success(
							JSON.parse(getData()) as PHPStanCheckResult
						)
					);
				});
			}
		);
	}

	private async _checkProject(
		check: PHPStanCheck,
		onProgress: ProgressListener
	): Promise<ReturnResult<ReportedErrors>> {
		// Get config
		const config = await this._configManager.collectConfiguration();
		if (!config) {
			return ReturnResult.error();
		}
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		const pathMapper = await ConfigurationManager.getPathMapper(
			this._config
		);

		// Get args
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		const result = await this._getProcessOutput(config, check, {
			onProgress,
		});

		return result.chain((output) => {
			const parsed = new OutputParser(output).parse();

			// Turn raw fs paths into URIs
			const normalized: ReportedErrors = {
				fileSpecificErrors: {},
				notFileSpecificErrors: parsed.notFileSpecificErrors,
			};
			for (const filePath in parsed.fileSpecificErrors) {
				normalized.fileSpecificErrors[
					URI.from({
						scheme: 'file',
						path: pathMapper(filePath, true),
					}).toString()
				] = parsed.fileSpecificErrors[filePath];
			}
			return normalized;
		});
	}

	public async checkProject(
		check: PHPStanCheck,
		onProgress: ProgressListener
	): Promise<ReturnResult<ReportedErrors>> {
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
