import {
	HOVER_WAIT_CHUNK_TIME,
	MAX_HOVER_WAIT_TIME,
	PHPSTAN_1_NEON_FILE,
	NO_CANCEL_OPERATIONS,
	TREE_FETCHER_FILE,
	PHPSTAN_2_NEON_FILE,
} from '../../../shared/constants';
import type { CancellationToken, _Connection } from 'vscode-languageserver';
import { toCheckablePromise, waitPeriodical } from '../../../shared/util';
import type { PHPStanCheckManager } from '../lib/phpstan/manager';
import type { CheckConfig } from '../lib/phpstan/configManager';
import type { PHPStanVersion, PromisedValue } from '../server';
import type { DocumentManager } from '../lib/documentManager';
import { providerEnabled } from '../lib/providerUtil';
import { Disposable } from 'vscode-languageserver';
import { getConfiguration } from '../lib/config';
import { SERVER_PREFIX, log } from '../lib/log';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import * as path from 'path';

interface VariableData {
	typeDescr: string;
	name: string;
	pos: {
		start: {
			line: number;
			char: number;
		};
		end: {
			line: number;
			char: number;
		};
	};
}

type ProjectReport = Record<string, VariableData[][]>;

export interface ProviderArgs {
	connection: _Connection;
	hooks: ProviderCheckHooks;
	phpstan?: PHPStanCheckManager;
	workspaceFolder: PromisedValue<URI | null>;
	onConnectionInitialized: Promise<void>;
	documents: DocumentManager;
}

export async function getFileReport(
	providerArgs: ProviderArgs,
	cancelToken: CancellationToken,
	documentURI: string
): Promise<VariableData[][] | null> {
	if (!(await providerEnabled(providerArgs))) {
		return null;
	}

	const workspaceFolder = await providerArgs.workspaceFolder.get();
	if (
		!workspaceFolder ||
		(!NO_CANCEL_OPERATIONS && cancelToken.isCancellationRequested)
	) {
		return null;
	}

	// Ensure the file has been checked
	if (!providerArgs.phpstan) {
		return (
			providerArgs.hooks.getProjectReport()?.[
				URI.parse(documentURI).fsPath
			] ?? null
		);
	}
	const fileContent = providerArgs.documents.get(documentURI)?.content;
	const promise = toCheckablePromise(
		providerArgs.phpstan.checkProjectIfFileChanged(documentURI, fileContent)
	);

	// Check if the file is currently being checked. If so, wait for that to end.
	const result = await waitPeriodical<'cancel' | 'checkDone'>(
		MAX_HOVER_WAIT_TIME,
		HOVER_WAIT_CHUNK_TIME,
		() => {
			if (!NO_CANCEL_OPERATIONS && cancelToken.isCancellationRequested) {
				return 'cancel';
			}
			if (promise.done) {
				return 'checkDone';
			}
			return null;
		}
	);

	// Either timed out or was canceled
	if (result !== 'checkDone') {
		return null;
	}

	return (
		providerArgs.hooks.getProjectReport()?.[
			URI.parse(documentURI).fsPath
		] ?? null
	);
}

export class ProviderCheckHooks {
	private _lastOperation: {
		reportPath: string;
	} | null = null;
	private _lastReport: ProjectReport | null = null;

	private get _lsEnabled(): Promise<boolean> {
		return (async () => {
			return (
				await getConfiguration(this._connection, this._workspaceFolder)
			).enableLanguageServer;
		})();
	}

	public constructor(
		private readonly _connection: _Connection,
		private readonly _version: PromisedValue<PHPStanVersion | null>,
		private readonly _workspaceFolder: PromisedValue<URI | null>,
		private readonly _extensionPath: PromisedValue<URI>
	) {}

	private async _getFileReport(): Promise<ProjectReport | null> {
		if (!this._lastOperation) {
			return null;
		}
		try {
			const file = await fs.readFile(this._lastOperation.reportPath, {
				encoding: 'utf-8',
			});
			await fs.rm(this._lastOperation.reportPath);
			return JSON.parse(file) as ProjectReport;
		} catch (e) {
			return null;
		}
	}

	private async _getConfigFile(
		baseDir: string,
		userConfigFile: string
	): Promise<string> {
		const templateFile =
			(await this._version.get()) === '2.*'
				? PHPSTAN_2_NEON_FILE
				: PHPSTAN_1_NEON_FILE;
		const neonFileContent = (
			await fs.readFile(templateFile, {
				encoding: 'utf-8',
			})
		).replace('../test/demo/phpstan.neon', userConfigFile);
		const tmpNeonFilePath = path.join(baseDir, 'config.neon');
		await fs.writeFile(tmpNeonFilePath, neonFileContent, {
			encoding: 'utf8',
		});

		return tmpNeonFilePath;
	}

	private async _getAutoloadFile(
		baseDir: string,
		userAutoloadFile: string | null
	): Promise<{
		autoloadFilePath: string;
		treeFetcherReportedFilePath: tmp.FileResult;
	}> {
		const treeFetcherFilePath = path.join(baseDir, 'TreeFetcher.php');
		const treeFetcherReportedFilePath = await tmp.file({
			postfix: '.json',
		});
		const autoloadFilePath = path.join(baseDir, 'autoload.php');

		const treeFetcherContent = (
			await fs.readFile(TREE_FETCHER_FILE, {
				encoding: 'utf-8',
			})
		).replace('reported.json', treeFetcherReportedFilePath.path);

		await fs.mkdir(baseDir, {
			recursive: true,
		});
		await fs.writeFile(treeFetcherFilePath, treeFetcherContent, {
			encoding: 'utf-8',
		});

		let autoloadFileContent = '<?php\n';
		if (userAutoloadFile) {
			autoloadFileContent += `chdir('${path.dirname(
				userAutoloadFile
			)}');\n`;
			autoloadFileContent += `require_once '${userAutoloadFile}';\n`;
		}
		autoloadFileContent += `require_once '${treeFetcherFilePath}';`;
		await fs.writeFile(autoloadFilePath, autoloadFileContent, {
			encoding: 'utf-8',
		});

		this._lastOperation = {
			reportPath: treeFetcherReportedFilePath.path,
		};

		return {
			autoloadFilePath,
			treeFetcherReportedFilePath,
		};
	}

	private _findArg(
		config: CheckConfig,
		short: string,
		long: string
	): string | null {
		for (let i = 0; i < config.args.length; i++) {
			if (config.args[i] === short) {
				return config.args[i + 1];
			} else if (config.args[i].startsWith(long)) {
				if (config.args[i][long.length] === '=') {
					return config.args[i].slice(long.length + 1);
				} else {
					return config.args[i + 1];
				}
			}
		}
		return null;
	}

	public getProjectReport(): ProjectReport | null {
		return this._lastReport;
	}

	public clearReport(): void {
		this._lastReport = null;
	}

	public async transformArgs(
		config: CheckConfig,
		args: string[],
		disposables: Disposable[]
	): Promise<string[]> {
		if (!(await this._lsEnabled)) {
			return args;
		}

		void log(this._connection, SERVER_PREFIX, 'getting bin 3');
		const baseDir = path.join(
			(await this._extensionPath.get()).fsPath,
			'_config'
		);
		void log(this._connection, SERVER_PREFIX, 'getting bin 4');

		const userAutoloadFile = this._findArg(config, '-a', '--autoload-file');

		void log(this._connection, SERVER_PREFIX, 'getting bin 5');
		const { autoloadFilePath, treeFetcherReportedFilePath } =
			await this._getAutoloadFile(baseDir, userAutoloadFile);
		void log(this._connection, SERVER_PREFIX, 'getting bin 6');

		disposables.push(
			Disposable.create(() => {
				treeFetcherReportedFilePath.cleanup().catch((err) => {
					// No reason to really do anything else here, it's a tmp file anyway
					console.log('Error while deleting tmp folder', err);
				});
			})
		);

		args.push('-a', autoloadFilePath);
		void log(this._connection, SERVER_PREFIX, 'getting bin 7');
		if (config.configFile) {
			// No config is invalid anyway so we can just ignore this
			const configFile = await this._getConfigFile(
				baseDir,
				config.configFile
			);
			args.push('-c', configFile);
		}
		void log(this._connection, SERVER_PREFIX, 'getting bin 8');
		return args;
	}

	public async onCheckDone(): Promise<void> {
		if (!(await this._lsEnabled)) {
			return;
		}

		// TODO:(sander) collected data only represents the checked files. Need to merge
		// with previous report...
		const report = await this._getFileReport();
		this._lastReport = report;
	}
}
