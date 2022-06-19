import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import { EXTENSION_ID, TREE_FETCHER_FILE } from '../../../shared/constants';
import type { _Connection, TextDocuments } from 'vscode-languageserver';
import { assertUnreachable, createPromise } from '../../../shared/util';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { FileReport, ReporterFile } from './hoverProvider';
import { filterBaselineErrorsForFile } from './ignoreFilter';
import { OperationResult } from '../../../shared/statusBar';
import { showError, showErrorOnce } from './errorUtil';
import { Disposable } from 'vscode-languageserver';
import type { StatusBar } from './statusBar';
import { executeCommand } from './commands';
import { getConfiguration } from './config';
import { spawn } from 'child_process';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import { constants } from 'fs';
import * as path from 'path';
import { log } from './log';
import * as os from 'os';

interface CheckedFileData {
	content: string;
	reported: FileReport | null;
	check: PHPStanCheck;
	donePromise: Promise<CheckedFileData>;
	pending: boolean;
}

export class PHPStan implements Disposable {
	private _operations: Map<string, CheckedFileData> = new Map();
	private _timers: Set<NodeJS.Timeout> = new Set();
	private readonly _statusBar: StatusBar;
	private readonly _connection: _Connection;
	private readonly _disposables: Disposable[] = [];
	private readonly _getWorkspaceFolder: () => string | null;
	private readonly _documents: TextDocuments<TextDocument>;

	public constructor({
		statusBar,
		connection,
		getWorkspaceFolder,
		documents,
	}: {
		statusBar: StatusBar;
		connection: _Connection;
		getWorkspaceFolder: () => string | null;
		documents: TextDocuments<TextDocument>;
	}) {
		this._statusBar = statusBar;
		this._connection = connection;
		this._documents = documents;
		this._getWorkspaceFolder = getWorkspaceFolder;
	}

	private async _checkFile(
		e: Pick<TextDocument, 'uri' | 'getText' | 'languageId'>,
		dirty: boolean
	): Promise<CheckResult | ReturnValue> {
		if (e.languageId !== 'php') {
			await log(this._connection, 'Skipping', e.languageId, 'file');
			return ReturnValue.CANCELED;
		}

		await log(this._connection, 'Checking file', e.uri);

		const check = new PHPStanCheck(
			e,
			this._connection,
			this._getWorkspaceFolder
		);

		const promise = await createPromise<CheckedFileData>();
		this._operations.set(e.uri, {
			content: e.getText(),
			check,
			reported: null,
			donePromise: promise.promise,
			pending: true,
		});

		// Manage statusbar
		await this._statusBar.pushOperation(
			new Promise<OperationResult>((resolve) => {
				let isDone: boolean = false;
				check.onDone(() => {
					isDone = true;
					resolve(OperationResult.SUCCESS);
				});
				check.onCancel(() => {
					isDone = true;
					resolve(OperationResult.SUPERCEDED);
				});
				check.onError(() => {
					isDone = true;
					resolve(OperationResult.ERROR);
				});
				void getConfiguration(this._connection).then((config) => {
					const timeout = config.phpstan.timeout;
					const timer = setTimeout(() => {
						this._timers.delete(timer);
						if (!isDone) {
							if (!config.phpstan.suppressTimeoutMessage) {
								showError(
									this._connection,
									`PHPStan check timed out after ${timeout}ms`,
									[
										{
											title: 'Adjust timeout',
											callback: async () => {
												await executeCommand(
													this._connection,
													'workbench.action.openSettings',
													'phpstan.timeout'
												);
											},
										},
										{
											title: 'Stop showing this message',
											callback: async () => {
												await executeCommand(
													this._connection,
													'workbench.action.openSettings',
													'phpstan.suppressTimeoutMessage'
												);
											},
										},
									]
								);
							}
							void log(
								this._connection,
								`PHPStan check timed out after ${timeout}ms`
							);
							check.dispose();
							resolve(OperationResult.KILLED);
						}
					}, timeout);
					this._timers.add(timer);
				});
			})
		);

		// Do check
		const checkResult = await check.check(dirty);
		const reported =
			typeof checkResult === 'object' ? checkResult.reported : null;
		const checkedFileData = {
			...(this._operations.get(e.uri) as CheckedFileData),
			pending: false,
			reported: reported,
		};
		this._operations.set(e.uri, checkedFileData);
		promise.resolve(checkedFileData);
		if (checkResult === ReturnValue.ERROR) {
			await log(this._connection, 'File check failed for file', e.uri);
			return checkResult;
		}
		if (checkResult === ReturnValue.CANCELED) {
			await log(this._connection, 'File check canceled for file', e.uri);
			return checkResult;
		}
		if (typeof checkResult !== 'object') {
			assertUnreachable(checkResult);
		}

		await log(
			this._connection,
			'File check done for file',
			e.uri,
			'errors=',
			JSON.stringify(checkResult.errors.map((err) => err.message))
		);
		return checkResult;
	}

	public async checkFileAndRegisterErrors(
		e: Pick<TextDocument, 'uri' | 'getText' | 'languageId'>,
		dirty: boolean
	): Promise<void> {
		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.content === e.getText()) {
				// Same text, no need to run at all
				await log(
					this._connection,
					'Not checking file, file already has pending check'
				);
				return;
			}
			// Kill current running instances for this file
			operation.check.dispose();
		}

		const checkResult = await this._checkFile(e, dirty);
		if (checkResult === ReturnValue.ERROR) {
			await this._connection.sendDiagnostics({
				uri: e.uri.toString(),
				diagnostics: [],
			});
			await log(
				this._connection,
				'File check failed for file',
				e.uri,
				'clearing'
			);
			return;
		} else if (checkResult === ReturnValue.CANCELED) {
			return;
		}
		// eslint-disable-next-line prefer-const
		let { errors, config } = checkResult;
		if (config) {
			try {
				errors = await filterBaselineErrorsForFile(
					config,
					URI.parse(e.uri).fsPath,
					errors,
					this._disposables,
					this._connection
				);
			} catch (e) {
				// Ignore this step
				await log(
					this._connection,
					'Failed to filter baseline errors',
					(e as Error).message
				);
			}
		}
		await this._connection.sendDiagnostics({
			uri: e.uri.toString(),
			diagnostics: errors,
		});
	}

	public dispose(): void {
		this._operations.forEach((v) => v.check.dispose());
		this._timers.forEach((t) => clearTimeout(t));
		this._operations.clear();
		this._timers.clear();
		this._disposables.forEach((d) => void d.dispose());
	}
}

enum ReturnValue {
	ERROR,
	CANCELED,
}

interface CheckResult {
	config: CheckConfig;
	errors: Diagnostic[];
	reported: FileReport | null;
}

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

class PHPStanCheck implements Disposable {
	private _cancelled: boolean = false;
	private _onDoneListener: null | (() => void) = null;
	private _onErrorListener: null | (() => void) = null;
	private _onCancelListener: null | (() => void) = null;
	private _disposables: Disposable[] = [];
	private __config: CheckConfig | null = null;

	public constructor(
		private readonly _file: Pick<
			TextDocument,
			'uri' | 'getText' | 'languageId'
		>,
		private readonly _connection: _Connection,
		private readonly _getWorkspaceFolder: () => string | null
	) {}

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

	private async _getFilePath(
		e: Pick<TextDocument, 'uri' | 'getText' | 'languageId'>,
		dirty: boolean
	): Promise<string | ReturnValue.CANCELED> {
		const mappedPath = await this._applyPathMapping(
			URI.parse(e.uri).fsPath
		);

		if (dirty) {
			if (mappedPath !== URI.parse(e.uri).fsPath) {
				return ReturnValue.CANCELED;
			}
			const tmpFile = await tmp.file();
			await fs.writeFile(tmpFile.path, e.getText());
			this._disposables.push(
				Disposable.create(() => void tmpFile.cleanup())
			);
			return tmpFile.path;
		}

		return mappedPath;
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

	private async _createAutoloadFile(
		userAutoloadFile: string | null
	): Promise<{
		autoloadFile: string;
		reportedFile: string;
	}> {
		const tmpDir = await tmp.dir();
		const treeFetcherTmpFilePath = path.join(
			tmpDir.path,
			'TreeFetcher.php'
		);
		const treeFetcherReportedFilePath = path.join(
			tmpDir.path,
			'reported.json'
		);
		const autoloadFilePath = path.join(tmpDir.path, 'autoload.php');

		const treeFetcherContent = (
			await fs.readFile(TREE_FETCHER_FILE, {
				encoding: 'utf-8',
			})
		).replace('reported.json', treeFetcherReportedFilePath);
		await fs.writeFile(treeFetcherTmpFilePath, treeFetcherContent, {
			encoding: 'utf-8',
		});

		let autoloadFileContent = '<?php\n';
		if (userAutoloadFile) {
			autoloadFileContent += `chdir('${path.dirname(
				userAutoloadFile
			)}');\n`;
			autoloadFileContent += `require_once "${userAutoloadFile}";\n`;
		}
		autoloadFileContent += `require_once "${treeFetcherTmpFilePath}";`;
		await fs.writeFile(autoloadFilePath, autoloadFileContent, {
			encoding: 'utf-8',
		});

		this._disposables.push(Disposable.create(() => void tmpDir.cleanup()));

		return {
			autoloadFile: autoloadFilePath,
			reportedFile: treeFetcherReportedFilePath,
		};
	}

	private async _check(dirty: boolean): Promise<CheckResult | ReturnValue> {
		const config = await this.collectConfiguration();
		if (!config) {
			return ReturnValue.ERROR;
		}
		if (this._cancelled) {
			return ReturnValue.CANCELED;
		}

		const filePath = await this._getFilePath(this._file, dirty);
		if (this._cancelled) {
			return ReturnValue.CANCELED;
		}
		if (typeof filePath !== 'string') {
			return filePath;
		}

		const args = [...config.initialArgs, 'analyse'];
		if (config.remoteConfigFile) {
			args.push(...['-c', this._escapeFilePath(config.remoteConfigFile)]);
		}

		let userAutoloadFile: string | null = null;
		for (let i = 0; i < config.args.length; i++) {
			if (config.args[i] === '-a') {
				userAutoloadFile = config.args[i + 1];
			} else if (config.args[i].startsWith('--autoload-file')) {
				if (config.args[i]['--autoload-file'.length] === '=') {
					userAutoloadFile = config.args[i].slice(
						'--autoload-file'.length + 1
					);
				} else {
					userAutoloadFile = config.args[i + 1];
				}
			}
		}

		const { autoloadFile, reportedFile } = await this._createAutoloadFile(
			userAutoloadFile
		);

		args.push(
			...[
				'--error-format=raw',
				'--no-progress',
				'--no-interaction',
				`--memory-limit=${config.memoryLimit}`,
				...config.args,
				'-a',
				autoloadFile,
				this._escapeFilePath(filePath),
			]
		);
		const binStr = config.binCmd
			? config.binCmd
			: this._escapeFilePath(config.binPath!);
		await log(
			this._connection,
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

		let data: string = '';
		let errData: string = '';
		phpstan.stdout.on('data', (dataPart: string | Buffer): void => {
			if (dataPart instanceof Buffer) {
				data += dataPart.toString('utf8');
			} else {
				data += dataPart;
			}
		});
		phpstan.stderr.on('data', (dataPart: string | Buffer): void => {
			if (dataPart instanceof Buffer) {
				errData += dataPart.toString('utf8');
			} else {
				errData += dataPart;
			}
		});

		return await new Promise<CheckResult | ReturnValue>((resolve) => {
			phpstan.on('error', (e) => {
				void log(
					this._connection,
					'PHPStan process exited with error, error=',
					e.message,
					' errData=',
					errData,
					' data=',
					data
				);
				showError(
					this._connection,
					'PHPStan: process exited with error, see log for details'
				);
				resolve(ReturnValue.ERROR);
			});
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			phpstan.on('exit', async () => {
				if (this._cancelled) {
					return;
				}

				if (errData) {
					void log(
						this._connection,
						'PHPStan process exited successfully but with error message, error=',
						errData,
						' data=',
						data
					);
				} else {
					void log(
						this._connection,
						'PHPStan process exited succesfully'
					);
				}

				if (data.includes('Allowed memory size of')) {
					showError(
						this._connection,
						'PHPStan: Out of memory, try adding more memory by setting the phpstan.memoryLimit option',
						[
							{
								title: 'Go to option',
								callback: () => {
									void executeCommand(
										this._connection,
										'workbench.action.openSettings',
										`@ext:${EXTENSION_ID} memoryLimit`
									);
								},
							},
						]
					);
					resolve(ReturnValue.ERROR);
				}

				const reportedFileContent =
					await (async (): Promise<FileReport | null> => {
						try {
							const file = await fs.readFile(reportedFile, {
								encoding: 'utf-8',
							});
							const parsed = JSON.parse(file) as ReporterFile;
							return parsed[filePath];
						} catch (e) {
							return null;
						}
					})();
				resolve({
					config,
					errors: new OutputParser(
						data,
						filePath,
						this._file
					).parse(),
					reported: reportedFileContent,
				});
			});
		});
	}

	private async _applyPathMapping(filePath: string): Promise<string> {
		const pathMapping =
			(await getConfiguration(this._connection)).phpstan.paths ?? {};
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

	public async collectConfiguration(): Promise<
		CheckConfig | ReturnValue.ERROR
	> {
		if (this.__config) {
			return this.__config;
		}
		const extensionConfig = await getConfiguration(this._connection);

		const workspaceRoot = this._getWorkspaceFolder();
		const cwd =
			this._getAbsolutePath(
				extensionConfig.phpstan.rootDir,
				workspaceRoot ?? undefined
			) || workspaceRoot;

		if (cwd && !(await this._fileIfExists(cwd))) {
			await showErrorOnce(
				this._connection,
				`PHPStan: rootDir "${cwd}" does not exist`
			);
			return ReturnValue.ERROR;
		}

		if (!cwd) {
			await showErrorOnce(
				this._connection,
				'PHPStan: failed to get CWD',
				'workspaceRoot=',
				workspaceRoot ?? 'undefined'
			);
			return ReturnValue.ERROR;
		}

		const binCommand = extensionConfig.phpstan.binCommand;
		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.phpstan.binPath,
			cwd
		);
		const binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');

		if (!binPath && (!binCommand || binCommand.length === 0)) {
			await showErrorOnce(
				this._connection,
				'PHPStan: failed to find binary path'
			);
			return ReturnValue.ERROR;
		}

		if (
			(!binCommand || binCommand.length === 0) &&
			!(await this._fileIfExists(binPath))
		) {
			await showErrorOnce(
				this._connection,
				`PHPStan: failed to find binary at "${binPath}"`
			);
			return ReturnValue.ERROR;
		}

		const defaultConfigFile = this._getAbsolutePath(
			extensionConfig.phpstan.configFile,
			cwd
		);
		if (
			defaultConfigFile &&
			!(await this._fileIfExists(defaultConfigFile))
		) {
			await showErrorOnce(
				this._connection,
				`PHPStan: failed to find config file at "${defaultConfigFile}"`
			);
			return ReturnValue.ERROR;
		}

		const partialConfig = ((): Pick<
			CheckConfig,
			'initialArgs' | 'binPath' | 'binCmd'
		> => {
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
		})();
		const config: CheckConfig = {
			cwd,
			configFile: defaultConfigFile,
			remoteConfigFile: defaultConfigFile
				? await this._applyPathMapping(defaultConfigFile)
				: null,
			args: extensionConfig.phpstan.options ?? [],
			memoryLimit: extensionConfig.phpstan.memoryLimit,
			...partialConfig,
		};
		this.__config = config;
		return config;
	}

	public async check(dirty: boolean): Promise<CheckResult | ReturnValue> {
		const errors = await this._check(dirty);
		if (errors === ReturnValue.ERROR) {
			this._onErrorListener?.();
		} else if (errors === ReturnValue.CANCELED) {
			this._onCancelListener?.();
		} else if (typeof errors === 'object') {
			this._onDoneListener?.();
		} else {
			assertUnreachable(errors);
		}
		this.dispose();
		return errors;
	}

	public onDone(listener: () => void): void {
		this._onDoneListener = listener;
	}

	public onError(listener: () => void): void {
		this._onErrorListener = listener;
	}

	public onCancel(listener: () => void): void {
		this._onCancelListener = listener;
	}

	public dispose(): void {
		this._cancelled = true;
		this._onCancelListener?.();
		this._disposables.forEach((d) => d.dispose());
	}
}

class OutputParser {
	public constructor(
		private readonly _output: string,
		private readonly _filePath: string,
		private readonly _file: Pick<
			TextDocument,
			'uri' | 'getText' | 'languageId'
		>
	) {}

	public parse(): Diagnostic[] {
		return (
			this._output
				.split('\n')
				.map((l) => l.trim())
				.filter((l) => l.length > 0)
				.map((line) => {
					// Parse
					const match = /^(.*):(\d+):(.*)$/.exec(line);
					if (!match) {
						return null;
					}

					const [, file, lineNumber, message] = match;
					return {
						file,
						lineNumber: parseInt(lineNumber, 10),
						message,
					};
				})
				// Filter
				.filter(
					(
						result
					): result is {
						file: string;
						lineNumber: number;
						message: string;
					} => result !== null
				)
				.filter(({ file }) => file.includes(this._filePath))
				.map((error) => {
					// Get text range
					const line = error.lineNumber - 1;
					const fullLineText = this._file.getText().split('\n')[line];

					const { startChar, endChar } = (() => {
						const match = /^(\s*).*(\s*)$/.exec(fullLineText);
						if (match) {
							const [, leading, trailing] = match;
							return {
								startChar: leading.length,
								endChar: fullLineText.length - trailing.length,
							};
						}
						return {
							startChar: 0,
							endChar: fullLineText.length,
						};
					})();

					const range = Range.create(line, startChar, line, endChar);

					return Diagnostic.create(
						range,
						error.message,
						DiagnosticSeverity.Error
					);
				})
		);
	}
}
