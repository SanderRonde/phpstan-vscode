import {
	EXTENSION_ID,
	PROCESS_TIMEOUT,
	SPAWN_ARGS,
} from '../../../../shared/constants';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { PHPStanCheck, ProgressListener } from './check';
import { ConfigurationManager } from '../checkConfigManager';
import type { AsyncDisposable, ClassConfig } from '../types';
import type { CheckConfig } from '../checkConfigManager';
import { getEditorConfiguration } from '../editorConfig';
import type { ChildProcess } from 'child_process';
import { wait } from '../../../../shared/util';
import { executeCommand } from '../commands';
import { checkPrefix, log } from '../log';
import { showError } from '../errorUtil';
import { ReturnResult } from '../result';
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
				identifier?: string;
				ignorable: boolean;
				line: number;
				message: string;
				tip?: string;
			}[];
		}
	>;
	totals: {
		errors: number;
		file_errors: number;
	};
}

export class PHPStanRunner implements AsyncDisposable {
	private _cancelled: boolean = false;
	private _disposables = new Set<() => Promise<void>>();

	public constructor(private readonly _classConfig: ClassConfig) {}

	public static escapeFilePath(filePath: string): string {
		if (os.platform() !== 'win32') {
			return filePath;
		}
		if (filePath.indexOf(' ') !== -1) {
			filePath = '"' + filePath + '"';
		}
		return filePath;
	}

	private _kill(proc: ChildProcess): Promise<void> {
		return Promise.race<void>([
			new Promise((resolve) => {
				let killed = false;
				proc.once('exit', () => {
					killed = true;
					resolve();
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
			}),
			wait(1000 * 10),
		]);
	}

	private _createOutputCapturer(
		proc: ChildProcess,
		channel: 'stdout' | 'stderr',
		onProgress?: ProgressListener
	): () => string {
		let data: string = '';
		proc[channel]?.on('data', (dataPart: string | Buffer) => {
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
		const choice =
			await this._classConfig.connection.window.showErrorMessage(
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
				this._classConfig.connection,
				'workbench.action.openSettings',
				'phpstan.ignoreErrors'
			);
		}
	}

	private _filterIgnoredErrors(
		errors: string[],
		ignoredErrors: (string | RegExp)[]
	): string[] {
		for (const ignoreError of ignoredErrors) {
			const regExp = (() => {
				if (ignoreError instanceof RegExp) {
					return ignoreError;
				}
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

	private async _spawnProcess(
		checkConfig: CheckConfig,
		check: PHPStanCheck,
		withProgress: boolean
	): Promise<ChildProcess> {
		const [binStr, ...args] = await ConfigurationManager.getArgs(
			this._classConfig,
			checkConfig,
			withProgress
		);

		const env = { ...process.env };
		const configuration: Record<string, unknown> = {
			binStr,
			args: args,
		};
		if (checkConfig.tmpDir) {
			env.TMPDIR = checkConfig.tmpDir;
			configuration['tmpDir'] = checkConfig.tmpDir;
		}

		await log(
			this._classConfig.connection,
			checkPrefix(check),
			'Spawning PHPStan with the following configuration: ',
			JSON.stringify(configuration)
		);
		const phpstan =
			await this._classConfig.procSpawner.spawnWithRobustTimeout(
				binStr,
				args,
				PROCESS_TIMEOUT,
				{
					...SPAWN_ARGS,
					cwd: checkConfig.cwd,
					encoding: 'utf-8',
					env: env,
				}
			);

		return phpstan;
	}

	public async runProcess(
		checkConfig: CheckConfig,
		check: PHPStanCheck,
		{
			onProgress,
		}: {
			onProgress?: ProgressListener;
		} = {}
	): Promise<ReturnResult<PHPStanCheckResult>> {
		const phpstan = await this._spawnProcess(
			checkConfig,
			check,
			!!onProgress
		);

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
			const editorConfig = await getEditorConfiguration(
				this._classConfig
			);

			const errLines = getErr()
				.split('\n')
				.map((line) => line.trim())
				.filter((line) => line.length);
			return this._filterIgnoredErrors(
				errLines,
				editorConfig.ignoreErrors
			)
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
				this._classConfig.connection,
				checkPrefix(check),
				'PHPStan process exited with error',
				...(await getLogData()),
				...extraData
			);
			showError(
				this._classConfig.connection,
				'PHPStan: process exited with error, see log for details'
			);
		};

		const killProc = (): Promise<void> => this._kill(phpstan);
		this._disposables.add(killProc);

		return await new Promise<ReturnResult<PHPStanCheckResult>>(
			(resolve) => {
				phpstan.once('error', (e) => {
					this._disposables.delete(killProc);
					void onError([' errMsg=' + e.message]);
					resolve(ReturnResult.error());
				});
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				phpstan.once('exit', async () => {
					this._disposables.delete(killProc);
					if (this._cancelled) {
						resolve(ReturnResult.canceled());
						return;
					}

					// Check for warning
					if (getErr().includes('Allowed memory size of')) {
						showError(
							this._classConfig.connection,
							'PHPStan: Out of memory, try adding more memory by setting the phpstan.memoryLimit option',
							[
								{
									title: 'Go to option',
									callback: () => {
										void executeCommand(
											this._classConfig.connection,
											'workbench.action.openSettings',
											`@ext:${EXTENSION_ID} memoryLimit`
										);
									},
								},
							]
						);
						resolve(ReturnResult.error());
						return;
					}

					if (getErr().includes('No files found to analyse')) {
						const editorConfig = await getEditorConfiguration(
							this._classConfig
						);
						if (editorConfig.singleFileMode) {
							void log(
								this._classConfig.connection,
								checkPrefix(check),
								'PHPStan found no files to analyse'
							);

							await this._classConfig.hooks.provider.onCheckDone();

							resolve(
								ReturnResult.success({
									errors: [],
									files: {},
									totals: {
										errors: 0,
										file_errors: 0,
									},
								})
							);
							return;
						}
					}

					if (
						getErr().includes(
							'At least one path must be specified to analyse'
						)
					) {
						showError(
							this._classConfig.connection,
							'PHPStan: No paths specified to analyse, either specify "paths" in your config file or switch to single-file-check mode',
							[
								{
									title: 'View docs for "paths"',
									callback: () => {
										void executeCommand(
											this._classConfig.connection,
											'vscode.open',
											'https://phpstan.org/config-reference#analysed-files'
										);
									},
								},
								{
									title: 'Go to option single-file-check mode option',
									callback: () => {
										void executeCommand(
											this._classConfig.connection,
											'workbench.action.openSettings',
											`@ext:${EXTENSION_ID} singleFileMode`
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
						this._classConfig.connection,
						checkPrefix(check),
						'PHPStan process exited succesfully'
					);

					await this._classConfig.hooks.provider.onCheckDone();

					const stdout = getData();
					try {
						resolve(
							ReturnResult.success(
								JSON.parse(stdout) as PHPStanCheckResult
							)
						);
					} catch (e) {
						void log(
							this._classConfig.connection,
							checkPrefix(check),
							`Failed to parse PHPStan output: ${stdout}`
						);
						resolve(ReturnResult.error());
					}
				});
			}
		);
	}

	public async dispose(): Promise<void> {
		this._cancelled = true;
		await Promise.all(
			[...this._disposables].map((disposable) => disposable())
		);
		this._disposables.clear();
	}
}
