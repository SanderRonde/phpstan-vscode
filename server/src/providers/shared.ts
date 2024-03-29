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
import type { WorkspaceFolders } from '../server';
import { getConfiguration } from '../lib/config';
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

type ProjectReport = Record<string, VariableData[]>;

export interface ProviderArgs {
	connection: _Connection;
	hooks: ProviderCheckHooks;
	phpstan?: PHPStanCheckManager;
	workspaceFolders: PromisedValue<WorkspaceFolders | null>;
	onConnectionInitialized: Promise<void>;
	documents: DocumentManager;
}

export async function getFileReport(
	providerArgs: ProviderArgs,
	cancelToken: CancellationToken,
	documentURI: string
): Promise<VariableData[] | null> {
	if (!(await providerEnabled(providerArgs))) {
		return null;
	}

	const workspaceFolder = (await providerArgs.workspaceFolders.get())
		?.default;
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
	private _lastReport: ProjectReport | null = null;

	private get _lsEnabled(): Promise<boolean> {
		return (async () => {
			return (
				await getConfiguration(this._connection, this._workspaceFolders)
			).enableLanguageServer;
		})();
	}

	public constructor(
		private readonly _connection: _Connection,
		private readonly _version: PromisedValue<PHPStanVersion | null>,
		private readonly _workspaceFolders: PromisedValue<WorkspaceFolders | null>,
		private readonly _extensionPath: PromisedValue<URI>
	) {}

	private async _getReportPath(): Promise<string> {
		return path.join(
			(await this._extensionPath.get()).fsPath,
			'_config',
			'reported.json'
		);
	}

	private async _getFileReport(): Promise<ProjectReport | null> {
		const reportPath = await this._getReportPath();
		try {
			const file = await fs.readFile(reportPath, {
				encoding: 'utf-8',
			});
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
	): Promise<string> {
		const treeFetcherFilePath = path.join(baseDir, 'TreeFetcher.php');
		const autoloadFilePath = path.join(baseDir, 'autoload.php');

		const reportPath = await this._getReportPath();
		const treeFetcherContent = (
			await fs.readFile(TREE_FETCHER_FILE, {
				encoding: 'utf-8',
			})
		).replace('reported.json', reportPath);

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

		return autoloadFilePath;
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
		args: string[]
	): Promise<string[]> {
		if (!(await this._lsEnabled)) {
			return args;
		}

		const baseDir = path.join(
			(await this._extensionPath.get()).fsPath,
			'_config'
		);

		const userAutoloadFile = this._findArg(config, '-a', '--autoload-file');
		const autoloadFilePath = await this._getAutoloadFile(
			baseDir,
			userAutoloadFile
		);

		args.push('-a', autoloadFilePath);
		if (config.configFile) {
			// No config is invalid anyway so we can just ignore this
			const configFile = await this._getConfigFile(
				baseDir,
				config.configFile
			);
			args.push('-c', configFile);
		}
		return args;
	}

	public async onCheckDone(): Promise<void> {
		if (!(await this._lsEnabled)) {
			return;
		}

		const report = await this._getFileReport();
		this._lastReport = report;
	}
}
