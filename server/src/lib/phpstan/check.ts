import { EXTENSION_ID, TREE_FETCHER_FILE } from '../../../../shared/constants';
import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import { assertUnreachable, createPromise } from '../../../../shared/util';
import type { _Connection, TextDocuments } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import type { FileReport, ReporterFile } from '../hoverProvider';
import { OperationResult } from '../../../../shared/statusBar';
import { filterBaselineErrorsForFile } from '../ignoreFilter';
import { showError, showErrorOnce } from '../errorUtil';
import { Disposable } from 'vscode-languageserver';
import type { StatusBar } from '../statusBar';
import { executeCommand } from '../commands';
import { getConfiguration } from '../config';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import { constants } from 'fs';
import { log } from '../log';
import * as path from 'path';
import * as os from 'os';

type PartialDocument = Pick<TextDocument, 'uri' | 'getText' | 'languageId'>;

interface CheckedFileData {
	content: string;
	reported: FileReport | null;
	check: PHPStanCheck;
	donePromise: Promise<CheckedFileData>;
	pending: boolean;
}

interface CheckOperation {
	fileContent: string;
	check: PHPStanCheck;
}

interface ClassConfig {
	statusBar: StatusBar;
	connection: _Connection;
	getWorkspaceFolder: () => string | null;
	documents: TextDocuments<TextDocument>;
}

export class CheckManager implements Disposable {
	private _operations: Map<string, CheckOperation> = new Map();
	private readonly _disposables: Disposable[] = [];

	public constructor(private readonly _config: ClassConfig) {}

	private async _checkFile(
		e: PartialDocument,
		dirty: boolean
	): Promise<void> {
		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText()) {
				// Same text, no need to run at all
				await log(
					this._config.connection,
					'Not checking file, file already has pending check'
				);
				// TODO: return other operation
				return operation.check.onDone;
			}

			// Different content, kill previous check and start new one
			operation.check.kill();
		}
	}

	public async checkFile(e: PartialDocument, dirty: boolean): Promise<void> {
		if (e.languageId !== 'php') {
			await log(
				this._config.connection,
				'Skipping',
				e.languageId,
				'file'
			);
			return;
		}

		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText()) {
				// Same text, no need to run at all
				await log(
					this._config.connection,
					'Not checking file, file already has pending check'
				);
				// TODO: return other operation
				return operation.check.onDone;
			}

			// Different content, kill previous check and start new one
			operation.check.kill();
		}

		await log(this._config.connection, 'Checking file', e.uri);
		return this._checkFile(e, dirty);
	}

	public dispose(): void {
		this._operations.forEach((op) => op.check.dispose());
		this._operations.clear();
	}
}

class PHPStanCheck implements Disposable {
	private _disposables: Disposable[] = [];

	public constructor(private readonly _config: ClassConfig) {}

	public async check(e: PartialDocument, dirty: boolean): Promise<void> {
		const runner = new PHPStanRunner(this._config);
		const errorManager = new PHPStanCheckErrorManager(this._config);
		this._disposables.push(runner);

		const result = await runner.check(e, dirty);
		await errorManager.handleResult(result);

		this.dispose();
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
	}
}

class PHPStanRunner implements Disposable {
	private _cancelled: boolean = false;
	private _disposables: Disposable[] = [];
	private _configManager: ConfigurationManager = new ConfigurationManager(
		this._config
	);

	public constructor(private readonly _config: ClassConfig) {}

	private async _getFilePath(
		e: Pick<TextDocument, 'uri' | 'getText' | 'languageId'>,
		dirty: boolean
	): Promise<ReturnResult<string>> {
		const mappedPath = await ConfigurationManager.applyPathMapping(
			this._config,
			URI.parse(e.uri).fsPath
		);

		if (dirty) {
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

	private async _createAutoloadFile(
		userAutoloadFile: string | null
	): Promise<{
		autoloadFile: string;
		reportedFile: string;
	}> {
		const tmpDir = await tmp.dir();
		// TODO: should be done in responsible files, not here
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

	private async _getArgs(
		config: CheckConfig,
		filePath: string
	): Promise<string[]> {
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

		return args;
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
		args: string[]
	): Promise<ReturnResult<string>> {
		const phpstan = await this._spawnProcess(config, args);

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
			phpstan.on('exit', async (exitCode) => {
				// On exit
				if (this._cancelled) {
					resolve(ReturnResult.canceled());
					return;
				}

				if (exitCode !== 0) {
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

				// TODO: this should happen at the responsible spot, not here
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

				resolve(ReturnResult.success(getData()));
			});
		});
	}

	private async _check(
		file: PartialDocument,
		dirty: boolean
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
		const filePath = await this._getFilePath(file, dirty);
		if (this._cancelled) {
			return ReturnResult.canceled();
		}
		if (!filePath.success()) {
			return filePath.cast();
		}

		const args = await this._getArgs(config, filePath.value);
		const result = await this._getProcessOutput(config, args);

		return result.chain((output) => {
			return new OutputParser(output, filePath.value, file).parse();
		});
	}

	public async check(
		file: PartialDocument,
		dirty: boolean
	): Promise<ReturnResult<Diagnostic[]>> {
		const errors = await this._check(file, dirty);
		this.dispose();
		return errors;
	}

	public dispose(): void {
		this._cancelled = true;
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

class PHPStanCheckErrorManager {
	public constructor(private readonly _config: ClassConfig) {}

	private _showErrors(
		e: PartialDocument,
		errors: Diagnostic[]
	): Promise<void> {
		return this._config.connection.sendDiagnostics({
			uri: e.uri,
			diagnostics: errors,
		});
	}

	private _clearErrors(e: PartialDocument): Promise<void> {
		return this._config.connection.sendDiagnostics({
			uri: e.uri,
			diagnostics: [],
		});
	}

	public async handleResult(
		result: ReturnResult<Diagnostic[]>
	): Promise<void> {
		if (result.success()) {
			await this._showErrors(e, result.value);
		} else if (result.status === ReturnValue.ERROR) {
			await this._clearErrors(e);
		}
	}
}

export class PHPStan implements Disposable {
	private _operations: Map<string, CheckOperation> = new Map();
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

	public async checkFile(e: PartialDocument, dirty: boolean) {}

	public async checkFileAndRegisterErrors(
		e: PartialDocument,
		dirty: boolean
	): Promise<void> {
		// Kill current running instances for this file
		const operation = this._operations.get(e.uri);
		if (operation) {
			if (operation.fileContent === e.getText()) {
				// Same text, no need to run at all
				await log(
					this._connection,
					'Not checking file, file already has pending check'
				);
				// TODO: return other operation
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
	SUCCESS,
}

class ReturnResult<R> {
	protected constructor(public status: ReturnValue, public value: R | null) {}

	public static success<R>(result: R): ReturnResult<R> {
		return new ReturnResult(ReturnValue.SUCCESS, result);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static canceled(): ReturnResult<any> {
		return new ReturnResult(ReturnValue.CANCELED, null);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static error(): ReturnResult<any> {
		return new ReturnResult(ReturnValue.ERROR, null);
	}

	public success(): this is SuccessReturnResult<R> {
		return this.status === ReturnValue.SUCCESS;
	}

	public chain<N>(operation: (data: R) => N): ReturnResult<N> {
		if (!this.success()) {
			return this as unknown as ReturnResult<N>;
		}
		return ReturnResult.success(operation(this.value));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public cast(): ReturnResult<any> {
		return this;
	}
}

class SuccessReturnResult<R> extends ReturnResult<R> {
	protected constructor(
		public override status: ReturnValue.SUCCESS,
		public override value: R
	) {
		super(status, value);
	}
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

class PHPStanCheck2 implements Disposable {}

class ConfigurationManager {
	private __config: CheckConfig | null = null;

	public constructor(private readonly _config: ClassConfig) {}

	public static async applyPathMapping(
		config: ClassConfig,
		filePath: string
	): Promise<string> {
		const pathMapping =
			(await getConfiguration(config.connection)).phpstan.paths ?? {};
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

	private async _getCwd(): Promise<string | null> {
		const workspaceRoot = this._config.getWorkspaceFolder();
		const extensionConfig = await getConfiguration(this._config.connection);
		const cwd =
			this._getAbsolutePath(
				extensionConfig.phpstan.rootDir,
				workspaceRoot ?? undefined
			) || workspaceRoot;

		if (cwd && !(await this._fileIfExists(cwd))) {
			await showErrorOnce(
				this._config.connection,
				`PHPStan: rootDir "${cwd}" does not exist`
			);
			return null;
		}

		if (!cwd) {
			await showErrorOnce(
				this._config.connection,
				'PHPStan: failed to get CWD',
				'workspaceRoot=',
				workspaceRoot ?? 'undefined'
			);
			return null;
		}

		return cwd;
	}

	private async _getBinConfig(
		cwd: string
	): Promise<Pick<CheckConfig, 'initialArgs' | 'binPath' | 'binCmd'> | null> {
		const extensionConfig = await getConfiguration(this._config.connection);
		const defaultBinPath = this._getAbsolutePath(
			extensionConfig.phpstan.binPath,
			cwd
		);
		const binPath = defaultBinPath ?? path.join(cwd, 'vendor/bin/phpstan');
		const binCommand = extensionConfig.phpstan.binCommand;

		if (!binPath && (!binCommand || binCommand.length === 0)) {
			// No binary and no command
			await showErrorOnce(
				this._config.connection,
				'PHPStan: failed to find binary path'
			);
			return null;
		}

		if (
			(!binCommand || binCommand.length === 0) &&
			!(await this._fileIfExists(binPath))
		) {
			// Command binary does not exist
			await showErrorOnce(
				this._config.connection,
				`PHPStan: failed to find binary at "${binPath}"`
			);
			return null;
		}

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
	}

	private async _getConfigFile(cwd: string): Promise<string | null> {
		const extensionConfig = await getConfiguration(this._config.connection);
		const defaultConfigFile = this._getAbsolutePath(
			extensionConfig.phpstan.configFile,
			cwd
		);
		if (
			defaultConfigFile &&
			!(await this._fileIfExists(defaultConfigFile))
		) {
			await showErrorOnce(
				this._config.connection,
				`PHPStan: failed to find config file at "${defaultConfigFile}"`
			);
			return null;
		}

		return defaultConfigFile;
	}

	public async collectConfiguration(): Promise<CheckConfig | null> {
		if (this.__config) {
			return this.__config;
		}
		// Settings
		const extensionConfig = await getConfiguration(this._config.connection);

		const cwd = await this._getCwd();
		if (!cwd) {
			return null;
		}
		const binConfig = await this._getBinConfig(cwd);
		if (!binConfig) {
			return null;
		}
		const configFile = await this._getConfigFile(cwd);
		if (!configFile) {
			return null;
		}

		const config: CheckConfig = {
			cwd,
			configFile,
			remoteConfigFile: configFile
				? await ConfigurationManager.applyPathMapping(
						this._config,
						configFile
				  )
				: null,
			args: extensionConfig.phpstan.options ?? [],
			memoryLimit: extensionConfig.phpstan.memoryLimit,
			...binConfig,
		};
		this.__config = config;
		return config;
	}
}
