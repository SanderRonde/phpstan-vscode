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
import type { PHPStanVersion, WorkspaceFolderGetter } from '../server';
import type { PHPStanCheckManager } from '../lib/phpstan/manager';
import type { CheckConfig } from '../lib/phpstan/configManager';
import type { DocumentManager } from '../lib/documentManager';
import { providerEnabled } from '../lib/providerUtil';
import { Disposable } from 'vscode-languageserver';
import type { DirectoryResult } from 'tmp-promise';
import { getConfiguration } from '../lib/config';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import * as path from 'path';

interface VariableData {
	typeDescription: string;
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

interface FileReport {
	varValues: VariableData[];
}

type ProjectReport = Record<string, FileReport>;

export interface ProviderArgs {
	connection: _Connection;
	hooks: ProviderCheckHooks;
	phpstan?: PHPStanCheckManager;
	getWorkspaceFolder: WorkspaceFolderGetter;
	onConnectionInitialized: Promise<void>;
	documents: DocumentManager;
}

export async function getFileReport(
	providerArgs: ProviderArgs,
	cancelToken: CancellationToken,
	documentURI: string
): Promise<FileReport | null> {
	if (!(await providerEnabled(providerArgs))) {
		return null;
	}

	const workspaceFolder = providerArgs.getWorkspaceFolder();
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
				await getConfiguration(
					this._connection,
					this._getWorkspaceFolder
				)
			).enableLanguageServer;
		})();
	}

	public constructor(
		private readonly _connection: _Connection,
		private readonly _getVersion: () => PHPStanVersion | null,
		private readonly _getWorkspaceFolder: WorkspaceFolderGetter
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
		tmpDir: DirectoryResult,
		userConfigFile: string
	): Promise<string> {
		const templateFile =
			this._getVersion() === '2.*'
				? PHPSTAN_2_NEON_FILE
				: PHPSTAN_1_NEON_FILE;
		const neonFileContent = (
			await fs.readFile(templateFile, {
				encoding: 'utf-8',
			})
		).replace('../test/demo/phpstan.neon', userConfigFile);
		const tmpNeonFilePath = path.join(tmpDir.path, 'config.neon');
		await fs.writeFile(tmpNeonFilePath, neonFileContent, {
			encoding: 'utf8',
		});

		return tmpNeonFilePath;
	}

	private async _getAutoloadFile(
		tmpDir: DirectoryResult,
		userAutoloadFile: string | null
	): Promise<string> {
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
		)
			.replace('reported.json', treeFetcherReportedFilePath)
			.replace('DEV = true', 'DEV = false');
		await fs.writeFile(treeFetcherTmpFilePath, treeFetcherContent, {
			encoding: 'utf-8',
		});

		let autoloadFileContent = '<?php\n';
		if (userAutoloadFile) {
			autoloadFileContent += `chdir('${path.dirname(
				userAutoloadFile
			)}');\n`;
			autoloadFileContent += `require_once '${userAutoloadFile}';\n`;
		}
		autoloadFileContent += `require_once '${treeFetcherTmpFilePath}';`;
		await fs.writeFile(autoloadFilePath, autoloadFileContent, {
			encoding: 'utf-8',
		});

		this._lastOperation = {
			reportPath: treeFetcherReportedFilePath,
		};

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

	public prepareForCheck(): void {
		// Clear
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

		const tmpDir = await tmp.dir();
		disposables.push(
			Disposable.create(() => {
				void fs.rm(tmpDir.path, { recursive: true }).catch((err) => {
					// No reason to really do anything else here, it's a tmp file anyway
					console.log('Error while deleting tmp folder', err);
				});
			})
		);

		const userAutoloadFile = this._findArg(config, '-a', '--autoload-file');

		const autoloadFile = await this._getAutoloadFile(
			tmpDir,
			userAutoloadFile
		);

		args.push('-a', autoloadFile);
		if (config.configFile) {
			// No config is invalid anyway so we can just ignore this
			const configFile = await this._getConfigFile(
				tmpDir,
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
