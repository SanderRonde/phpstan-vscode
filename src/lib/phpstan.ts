import { filterBaselineErrorsForFile } from './ignoreFilter';
import { OperationResult, StatusBar } from './statusBar';
import { showError, showErrorOnce } from './error-util';
import { ErrorHandler } from './errorHandler';
import { getConfiguration } from './config';
import { EXTENSION_ID } from './constants';
import { assertUnreachable } from './util';
import { spawn } from 'child_process';
import { Disposable } from 'vscode';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import * as vscode from 'vscode';
import { constants } from 'fs';
import * as path from 'path';
import { log } from './log';
import * as os from 'os';

export class PHPStan implements Disposable {
	private _runningOperations: Map<
		string,
		{
			content: string;
			check: PHPStanCheck;
		}
	> = new Map();
	private _timers: Set<NodeJS.Timeout> = new Set();
	private readonly _errorHandler: ErrorHandler;
	private readonly _statusBar: StatusBar;
	private readonly _context: vscode.ExtensionContext;

	public constructor({
		errorHandler,
		statusBar,
		context,
	}: {
		statusBar: StatusBar;
		errorHandler: ErrorHandler;
		context: vscode.ExtensionContext;
	}) {
		this._errorHandler = errorHandler;
		this._statusBar = statusBar;
		this._context = context;
	}

	private async _checkFile(
		e: vscode.TextDocument
	): Promise<CheckResult | ReturnValue> {
		if (e.languageId !== 'php') {
			log('Skipping', e.languageId, 'file');
			return ReturnValue.CANCELED;
		}

		log('Checking file', e.fileName);

		const check = new PHPStanCheck(e);
		this._runningOperations.set(e.fileName, {
			content: e.getText(),
			check,
		});
		this._statusBar.pushOperation(
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
				const timeout = getConfiguration().get('phpstan.timeout');
				const timer = setTimeout(() => {
					this._timers.delete(timer);
					if (!isDone) {
						if (
							!getConfiguration().get(
								'phpstan.suppressTimeoutMessage'
							)
						) {
							showError(
								`PHPStan check timed out after ${timeout}ms`,
								[
									{
										title: 'Adjust timeout',
										callback: async () => {
											await vscode.commands.executeCommand(
												'workbench.action.openSettings',
												'phpstan.timeout'
											);
										},
									},
									{
										title: 'Stop showing this message',
										callback: async () => {
											await vscode.commands.executeCommand(
												'workbench.action.openSettings',
												'phpstan.suppressTimeoutMessage'
											);
										},
									},
								]
							);
						}
						log(`PHPStan check timed out after ${timeout}ms`);
						check.dispose();
						resolve(OperationResult.KILLED);
					}
				}, timeout);
				this._timers.add(timer);
			})
		);
		const checkResult = await check.check();
		this._runningOperations.delete(e.fileName);
		if (checkResult === ReturnValue.ERROR) {
			log('File check failed for file', e.fileName);
			return checkResult;
		}
		if (checkResult === ReturnValue.CANCELED) {
			log('File check canceled for file', e.fileName);
			return checkResult;
		}
		if (typeof checkResult !== 'object') {
			assertUnreachable(checkResult);
		}

		log(
			'File check done for file',
			e.fileName,
			'errors=',
			checkResult.errors.map((e) => e.message).join(', ')
		);
		return checkResult;
	}

	public async checkFileAndRegisterErrors(
		e: vscode.TextDocument
	): Promise<void> {
		// Kill current running instances for this file
		if (this._runningOperations.has(e.fileName)) {
			const previousOperation = this._runningOperations.get(e.fileName)!;
			if (previousOperation.content === e.getText()) {
				// Same text, no need to run at all
				log('File already has pending check');
				return;
			}
			// Kill current running instances for this file
			if (this._runningOperations.has(e.fileName)) {
				this._runningOperations.get(e.fileName)!.check.dispose();
			}
		}

		const checkResult = await this._checkFile(e);
		if (checkResult === ReturnValue.ERROR) {
			this._errorHandler.clearForDocument(e);
			log('File check failed for file', e.fileName, 'clearing');
			return;
		} else if (checkResult === ReturnValue.CANCELED) {
			return;
		}
		const { errors, config } = checkResult;
		const filteredErrors = !config
			? errors
			: await filterBaselineErrorsForFile(
					config,
					e.fileName,
					errors,
					this._context
			  );
		this._errorHandler.showForDocument(e, filteredErrors);
	}

	public dispose(): void {
		this._runningOperations.forEach((v) => v.check.dispose());
		this._timers.forEach((t) => clearTimeout(t));
		this._runningOperations.clear();
		this._timers.clear();
	}
}

enum ReturnValue {
	ERROR,
	CANCELED,
}

interface CheckResult {
	config: CheckConfig;
	errors: vscode.Diagnostic[];
}

export interface CheckConfig {
	cwd: string;
	configFile: string;
	remoteConfigFile: string;
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

	public constructor(private readonly _file: vscode.TextDocument) {}

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
		e: vscode.TextDocument
	): Promise<string | ReturnValue.CANCELED> {
		const mappedPath = this._applyPathMapping(e.fileName);

		if (e.isDirty) {
			if (mappedPath !== e.fileName) {
				return ReturnValue.CANCELED;
			}
			const tmpFile = await tmp.file();
			await fs.writeFile(tmpFile.path, e.getText());
			this._disposables.push(new Disposable(() => tmpFile.cleanup()));
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

	private async _check(): Promise<CheckResult | ReturnValue> {
		const config = await this.collectConfiguration();
		if (!config) {
			return ReturnValue.ERROR;
		}
		if (this._cancelled) {
			return ReturnValue.CANCELED;
		}

		const filePath = await this._getFilePath(this._file);
		if (this._cancelled) {
			return ReturnValue.CANCELED;
		}
		if (typeof filePath !== 'string') {
			return filePath;
		}

		const args = [
			...config.initialArgs,
			'analyse',
			'-c',
			this._escapeFilePath(config.remoteConfigFile),
			'--error-format=raw',
			'--no-progress',
			'--no-interaction',
			`--memory-limit=${config.memoryLimit}`,
			...config.args,
			this._escapeFilePath(filePath),
		];
		const binStr = config.binCmd
			? config.binCmd
			: this._escapeFilePath(config.binPath!);
		log(
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
			new Disposable(() => !phpstan.killed && phpstan.kill())
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
				log(
					'PHPStan process exited with error, error=',
					e.message,
					' errData=',
					errData,
					' data=',
					data
				);
				showError(
					'PHPStan: process exited with error, see log for details'
				);
				resolve(ReturnValue.ERROR);
			});
			phpstan.on('exit', () => {
				if (this._cancelled) {
					return;
				}

				if (errData) {
					log(
						'PHPStan process exited successfully but with error message, error=',
						errData,
						' data=',
						data
					);
				} else {
					log('PHPStan process exited succesfully');
				}

				if (data.includes('Allowed memory size of')) {
					showError(
						'PHPStan: Out of memory, try adding more memory by setting the phpstan.memoryLimit option',
						[
							{
								title: 'Go to option',
								callback: () => {
									void vscode.commands.executeCommand(
										'workbench.action.openSettings',
										`@ext:${EXTENSION_ID} memoryLimit`
									);
								},
							},
						]
					);
					resolve(ReturnValue.ERROR);
				}
				resolve({
					config,
					errors: new OutputParser(
						data,
						filePath,
						this._file
					).parse(),
				});
			});
		});
	}

	private _applyPathMapping(filePath: string): string {
		const pathMapping = getConfiguration().get('phpstan.paths') ?? {};
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
		const extensionConfig = getConfiguration();

		const workspaceRoot =
			vscode.workspace.getWorkspaceFolder(this._file.uri)?.uri.fsPath ??
			vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
		const cwd =
			this._getAbsolutePath(
				extensionConfig.get('phpstan.rootDir'),
				workspaceRoot
			) || workspaceRoot;

		if (cwd && !(await this._fileIfExists(cwd))) {
			showErrorOnce(`PHPStan: rootDir "${cwd}" does not exist`);
			return ReturnValue.ERROR;
		}

		if (!cwd) {
			showErrorOnce(
				'PHPStan: failed to get CWD',
				'workspaceRoot=',
				workspaceRoot ?? 'undefined'
			);
			return ReturnValue.ERROR;
		}

		const binCommand = extensionConfig.get('phpstan.binCommand');
		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.get('phpstan.binPath'),
			cwd
		);
		const binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');

		if (!binPath && (!binCommand || binCommand.length === 0)) {
			showErrorOnce('PHPStan: failed to find binary path');
			return ReturnValue.ERROR;
		}

		if (
			(!binCommand || binCommand.length === 0) &&
			!(await this._fileIfExists(binPath))
		) {
			showErrorOnce(`PHPStan: failed to find binary at "${binPath}"`);
			return ReturnValue.ERROR;
		}

		const defaultConfigFile = this._getAbsolutePath(
			extensionConfig.get('phpstan.configFile'),
			cwd
		);
		if (
			defaultConfigFile &&
			!(await this._fileIfExists(defaultConfigFile))
		) {
			showErrorOnce(
				`PHPStan: failed to find config file at "${defaultConfigFile}"`
			);
			return ReturnValue.ERROR;
		}

		const configFile =
			defaultConfigFile ??
			(await this._fileIfExists(path.join(cwd, 'phpstan.neon'))) ??
			(await this._fileIfExists(path.join(cwd, 'phpstan.neon.dist')));

		if (!configFile) {
			showErrorOnce('PHPStan: failed to find config file');
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
			configFile: this._escapeFilePath(configFile),
			remoteConfigFile: this._applyPathMapping(configFile),
			args: extensionConfig.get('phpstan.options') ?? [],
			memoryLimit: extensionConfig.get('phpstan.memoryLimit'),
			...partialConfig,
		};
		this.__config = config;
		return config;
	}

	public async check(): Promise<CheckResult | ReturnValue> {
		const errors = await this._check();
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
		Disposable.from(...this._disposables).dispose();
	}
}

class OutputParser {
	public constructor(
		private readonly _output: string,
		private readonly _filePath: string,
		private readonly _file: vscode.TextDocument
	) {}

	public parse(): vscode.Diagnostic[] {
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
					const fullLineText = this._file.lineAt(line).text;

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

					const range = new vscode.Range(
						line,
						startChar,
						line,
						endChar
					);

					return new vscode.Diagnostic(
						range,
						error.message,
						vscode.DiagnosticSeverity.Error
					);
				})
		);
	}
}
