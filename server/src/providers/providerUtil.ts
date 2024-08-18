import {
	HOVER_WAIT_CHUNK_TIME,
	MAX_HOVER_WAIT_TIME,
	PHPSTAN_1_NEON_FILE,
	NO_CANCEL_OPERATIONS,
	TREE_FETCHER_FILE,
	PHPSTAN_2_NEON_FILE,
} from '../../../shared/constants';
import {
	basicHash,
	toCheckablePromise,
	waitPeriodical,
} from '../../../shared/util';
import type { CancellationToken, _Connection } from 'vscode-languageserver';
import type { PHPStanCheckManager } from '../lib/phpstan/checkManager';
import type { WorkspaceFolders, PromisedValue } from '../lib/types';
import type { DocumentManager } from '../lib/documentManager';
import type { CheckConfig } from '../lib/checkConfigManager';
import { getEditorConfiguration } from '../lib/editorConfig';
import type { PHPStanVersion } from '../start/getVersion';
import { ResolvedPromisedValue } from '../lib/types';
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
	const fileContent = providerArgs.documents.getFile(documentURI)?.content;
	if (!fileContent) {
		return null;
	}
	const promise = toCheckablePromise(
		providerArgs.phpstan.checkIfChanged(
			{
				content: fileContent,
				uri: documentURI,
				languageId: 'php',
			},
			'Hover action'
		)
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
				await getEditorConfiguration({
					connection: this._connection,
					workspaceFolders: this._workspaceFolders,
					editorConfigOverride: new ResolvedPromisedValue({}),
				})
			).enableLanguageServer;
		})();
	}

	public constructor(
		private readonly _connection: _Connection,
		private readonly _version: PromisedValue<PHPStanVersion | null>,
		private readonly _workspaceFolders: PromisedValue<WorkspaceFolders | null>,
		private readonly _extensionPath: PromisedValue<URI>
	) {}

	private async _getConfigPath(): Promise<string | null> {
		const workspaceFolder = await this._workspaceFolders.get();
		if (!workspaceFolder) {
			return null;
		}

		return path.join(
			(await this._extensionPath.get()).fsPath,
			'_config',
			basicHash(workspaceFolder.default.fsPath)
		);
	}

	private _getReportPath(configPath: string): string {
		return path.join(configPath, 'reported.json');
	}

	private async _getFileReport(): Promise<ProjectReport | null> {
		const configPath = await this._getConfigPath();
		if (!configPath) {
			return null;
		}
		const reportPath = this._getReportPath(configPath);
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
		)
			.replace('../test/demo/phpstan.neon', userConfigFile)
			.replace('../test/cacheDir', path.join(baseDir, 'cache'));
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

		const reportPath = this._getReportPath(baseDir);
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
		checkConfig: CheckConfig,
		short: string,
		long: string
	): string | null {
		for (let i = 0; i < checkConfig.args.length; i++) {
			if (checkConfig.args[i] === short) {
				return checkConfig.args[i + 1];
			} else if (checkConfig.args[i].startsWith(long)) {
				if (checkConfig.args[i][long.length] === '=') {
					return checkConfig.args[i].slice(long.length + 1);
				} else {
					return checkConfig.args[i + 1];
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
		checkConfig: CheckConfig,
		args: string[]
	): Promise<string[]> {
		if (!(await this._lsEnabled)) {
			return args;
		}

		const baseDir = await this._getConfigPath();
		if (!baseDir) {
			return args;
		}

		await fs.mkdir(baseDir, {
			recursive: true,
		});

		const userAutoloadFile = this._findArg(
			checkConfig,
			'-a',
			'--autoload-file'
		);
		const autoloadFilePath = await this._getAutoloadFile(
			baseDir,
			userAutoloadFile
		);

		args.push('-a', autoloadFilePath);
		if (checkConfig.configFile) {
			// No config is invalid anyway so we can just ignore this
			const configFile = await this._getConfigFile(
				baseDir,
				checkConfig.configFile
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

export async function providerEnabled(
	providerArgs: ProviderArgs
): Promise<boolean> {
	const configuration = await getEditorConfiguration({
		...providerArgs,
		editorConfigOverride: new ResolvedPromisedValue({}),
	});
	return (
		configuration.enableLanguageServer &&
		configuration.enabled &&
		Object.keys(configuration.paths).length <= 0
	);
}
