import { filterBaselineErrorsForFile } from './ignoreFilter';
import { OperationResult, StatusBar } from './statusBar';
import { showError, showErrorOnce } from './error-util';
import { ErrorHandler } from './errorHandler';
import { getConfiguration } from './config';
import { EXTENSION_ID } from './constants';
import { spawn } from 'child_process';
import { Disposable } from 'vscode';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import * as vscode from 'vscode';
import { constants } from 'fs';
import * as path from 'path';
import { log } from './log';

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

	private async _checkFile(e: vscode.TextDocument): Promise<{
		errors: vscode.Diagnostic[];
		configuration: CheckConfig | null;
	} | null> {
		if (e.languageId !== 'php') {
			return {
				errors: [],
				configuration: null,
			};
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
		if (!checkResult) {
			log('File check failed for file', e.fileName);
			return null;
		}
		const returnValue = {
			errors: checkResult,
			configuration: await check.collectConfiguration(),
		};
		log(
			'File check done for file',
			e.fileName,
			'errors=',
			returnValue.errors.map((e) => e.message).join(', ')
		);
		return returnValue;
	}

	public async checkFileAndRegisterErrors(
		e: vscode.TextDocument
	): Promise<void> {
		// Kill current running instances for this file
		if (this._runningOperations.has(e.fileName)) {
			const previousOperation = this._runningOperations.get(e.fileName)!;
			if (previousOperation.content === e.getText()) {
				// Same text, no need to run at all
				return;
			}
			// Kill current running instances for this file
			if (this._runningOperations.has(e.fileName)) {
				this._runningOperations.get(e.fileName)!.check.dispose();
			}
		}

		const checkResult = await this._checkFile(e);
		if (!checkResult) {
			this._errorHandler.clearForDocument(e);
			log('File check failed for file', e.fileName, 'clearing');
			return;
		}
		const { errors, configuration } = checkResult;
		const filteredErrors = !configuration
			? errors
			: await filterBaselineErrorsForFile(
					configuration,
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

export interface CheckConfig {
	cwd: string;
	configFile: string;
	binPath: string;
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

	private async _getFilePath(e: vscode.TextDocument): Promise<string> {
		if (e.isDirty) {
			const tmpFile = await tmp.file();
			await fs.writeFile(tmpFile.path, e.getText());
			this._disposables.push(new Disposable(() => tmpFile.cleanup()));
			return tmpFile.path;
		}

		return e.fileName;
	}

	private async _check(): Promise<vscode.Diagnostic[] | null> {
		const config = await this.collectConfiguration();
		if (!config) {
			return null;
		}
		if (this._cancelled) {
			return [];
		}

		const filePath = await this._getFilePath(this._file);
		if (this._cancelled) {
			return [];
		}

		const args = [
			'analyse',
			'-c',
			config.configFile,
			'--error-format=raw',
			'--no-progress',
			'--no-interaction',
			`--memory-limit=${config.memoryLimit}`,
			...config.args,
			filePath,
		];
		log(
			'Spawning PHPStan with the following configuration: ',
			JSON.stringify({
				binPath: config.binPath,
				args,
				cwd: config.cwd,
			})
		);
		const phpstan = spawn(config.binPath, args, {
			cwd: config.cwd,
			shell: process.platform === 'win32',
		});

		this._disposables.push(
			new Disposable(() => !phpstan.killed && phpstan.kill())
		);

		let data: string = '';
		const onData = (dataPart: string | Buffer): void => {
			if (dataPart instanceof Buffer) {
				data += dataPart.toString('utf8');
			} else {
				data += dataPart;
			}
		};
		phpstan.stdout.on('data', onData);
		phpstan.stderr.on('data', onData);

		return await new Promise<vscode.Diagnostic[] | null>((resolve) => {
			phpstan.on('error', (e) => {
				log(
					'PHPStan process exited with error, error=',
					e.message,
					' data=',
					data
				);
				resolve(null);
			});
			phpstan.on('exit', () => {
				if (this._cancelled) {
					return;
				}
				log('PHPStan process exited succesfully');

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
					resolve(null);
				}
				resolve(new OutputParser(data, filePath, this._file).parse());
			});
		});
	}

	public async collectConfiguration(): Promise<CheckConfig | null> {
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
			return null;
		}

		if (!cwd) {
			showErrorOnce(
				'PHPStan: failed to get CWD',
				'workspaceRoot=',
				workspaceRoot ?? 'undefined'
			);
			return null;
		}

		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.get('phpstan.binPath'),
			cwd
		);
		const binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');

		if (!binPath) {
			showErrorOnce('PHPStan: failed to find binary path');
			return null;
		}

		if (!(await this._fileIfExists(binPath))) {
			showErrorOnce(`PHPStan: failed to find binary at "${binPath}"`);
			return null;
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
			return null;
		}

		const configFile =
			defaultConfigFile ??
			(await this._fileIfExists(path.join(cwd, 'phpstan.neon'))) ??
			(await this._fileIfExists(path.join(cwd, 'phpstan.neon.dist')));

		if (!configFile) {
			showErrorOnce('PHPStan: failed to find config file');
			return null;
		}

		const config = {
			cwd,
			configFile,
			binPath,
			args: extensionConfig.get('phpstan.options') ?? [],
			memoryLimit: extensionConfig.get('phpstan.memoryLimit'),
		};
		this.__config = config;
		return config;
	}

	public async check(): Promise<vscode.Diagnostic[] | null> {
		const errors = await this._check();
		if (errors === null) {
			this._onErrorListener?.();
		} else {
			this._onDoneListener?.();
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
