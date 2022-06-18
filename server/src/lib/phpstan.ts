import type {
	_Connection,
	TextDocumentIdentifier,
	TextDocuments,
} from 'vscode-languageserver';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { EXTENSION_ID, ROOT_FOLDER } from '../../../shared/constants';
import { filterBaselineErrorsForFile } from './ignoreFilter';
import { OperationResult } from '../../../shared/statusBar';
import { assertUnreachable } from '../../../shared/util';
import { showError, showErrorOnce } from './errorUtil';
import type { StatusBar } from './statusBar';
import { executeCommand } from './commands';
import { getConfiguration } from './config';
import { spawn } from 'child_process';
import { Disposable } from 'vscode';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
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
	private _checkedFiles: Set<string> = new Set();
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
		this._runningOperations.set(e.uri, {
			content: e.getText(),
			check,
		});
		this._checkedFiles.add(e.uri);
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
					const timeout = config.get('phpstan.timeout');
					const timer = setTimeout(() => {
						this._timers.delete(timer);
						if (!isDone) {
							if (!config.get('phpstan.suppressTimeoutMessage')) {
								showError(
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
		const checkResult = await check.check(dirty);
		this._runningOperations.delete(e.uri);
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
		if (this._runningOperations.has(e.uri)) {
			const previousOperation = this._runningOperations.get(e.uri)!;
			if (previousOperation.content === e.getText()) {
				// Same text, no need to run at all
				await log(this._connection, 'File already has pending check');
				return;
			}
			// Kill current running instances for this file
			if (this._runningOperations.has(e.uri)) {
				this._runningOperations.get(e.uri)!.check.dispose();
			}
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
					this._disposables
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

	public fileIsPending(filePath: string): boolean {
		return this._runningOperations.has(filePath);
	}

	public async ensureFileChecked(doc: TextDocumentIdentifier): Promise<void> {
		if (!this._checkedFiles.has(URI.parse(doc.uri).fsPath)) {
			// Assume dirty because we don't know any better
			const docContent = this._documents.get(doc.uri);
			if (docContent) {
				await this._checkFile(docContent, true);
			}
		}
	}

	public dispose(): void {
		this._runningOperations.forEach((v) => v.check.dispose());
		this._timers.forEach((t) => clearTimeout(t));
		this._runningOperations.clear();
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
		let autoloadFile = path.join(ROOT_FOLDER, 'php/extensionLoader.php');
		if (userAutoloadFile) {
			// Already defined, we have to make a tmp file that joins the two
			const userAutoloadFileContents = (
				await fs.readFile(userAutoloadFile, {
					encoding: 'utf-8',
				})
			).replace('<?php', '');
			const autoloadFileContents = (
				await fs.readFile(autoloadFile, {
					encoding: 'utf-8',
				})
			).replace('<?php', '');
			const joinedFile = `
				<?php

				chdir('${path.dirname(autoloadFile)}');

				${autoloadFileContents}

				chdir('${path.dirname(userAutoloadFile)}');

				${userAutoloadFileContents}
			`;
			const tempFile = await tmp.file();
			await fs.writeFile(tempFile.path, joinedFile);
			this._disposables.push(new Disposable(() => tempFile.cleanup()));
			autoloadFile = tempFile.path;
		}

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
					'PHPStan: process exited with error, see log for details'
				);
				resolve(ReturnValue.ERROR);
			});
			phpstan.on('exit', () => {
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

	private async _applyPathMapping(filePath: string): Promise<string> {
		const pathMapping =
			(await getConfiguration(this._connection)).get('phpstan.paths') ??
			{};
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
				extensionConfig.get('phpstan.rootDir'),
				workspaceRoot ?? undefined
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
			args: extensionConfig.get('phpstan.options') ?? [],
			memoryLimit: extensionConfig.get('phpstan.memoryLimit'),
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
		Disposable.from(...this._disposables).dispose();
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
