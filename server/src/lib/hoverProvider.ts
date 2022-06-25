import {
	HOVER_WAIT_CHUNK_TIME,
	MAX_HOVER_WAIT_TIME,
	NEON_FILE,
	NO_CANCEL_OPERATIONS,
	TREE_FETCHER_FILE,
} from '../../../shared/constants';
import type {
	Hover,
	HoverParams,
	ServerRequestHandler,
	_Connection,
} from 'vscode-languageserver';
import { toCheckablePromise, waitPeriodical } from '../../../shared/util';
import { getConfiguration, onChangeConfiguration } from './config';
import type { PHPStanCheckManager } from './phpstan/manager';
import type { CheckConfig } from './phpstan/configManager';
import { Disposable } from 'vscode-languageserver';
import type { DirectoryResult } from 'tmp-promise';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import * as path from 'path';
import { log } from './log';

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

export interface FileReport {
	timestamp: number;
	data: VariableData[];
}

export type ReporterFile = Record<string, FileReport>;

function pathsEnabled(paths: Record<string, string>): boolean {
	return Object.keys(paths).length > 0;
}

export function createHoverProvider(
	connection: _Connection,
	hooks: HoverProviderCheckHooks,
	phpstan: PHPStanCheckManager,
	getWorkspaceFolder: () => string | null,
	onConnectionInitialized: Promise<void>,
	disposables: Disposable[]
): ServerRequestHandler<HoverParams, Hover | undefined | null, never, void> {
	let enabled: Promise<boolean> = onConnectionInitialized.then(() => {
		return getConfiguration(connection).then(
			(config) => !pathsEnabled(config.phpstan.paths)
		);
	});
	void onConnectionInitialized.then(() => {
		disposables.push(
			onChangeConfiguration(connection, 'paths', (paths) => {
				enabled = Promise.resolve(!pathsEnabled(paths));
			})
		);
	});

	return async (hoverParams, cancelToken) => {
		if (!(await enabled)) {
			return null;
		}

		const workspaceFolder = getWorkspaceFolder();
		if (
			!workspaceFolder ||
			(!NO_CANCEL_OPERATIONS && cancelToken.isCancellationRequested)
		) {
			return null;
		}

		// Ensure the file has been checked
		void log(connection, 'Hovering, performing check');
		const promise = toCheckablePromise(
			phpstan.checkFileFromURI(hoverParams.textDocument.uri, false)
		);

		// Check if the file is currently being checked. If so, wait for that to end.
		const result = await waitPeriodical<'cancel' | 'checkDone'>(
			MAX_HOVER_WAIT_TIME,
			HOVER_WAIT_CHUNK_TIME,
			() => {
				if (
					!NO_CANCEL_OPERATIONS &&
					cancelToken.isCancellationRequested
				) {
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

		// Look for it
		for (const type of hooks.getFileReport(hoverParams.textDocument.uri)
			?.data ?? []) {
			if (
				type.pos.start.line === hoverParams.position.line &&
				type.pos.start.char < hoverParams.position.character &&
				type.pos.end.char > hoverParams.position.character
			) {
				void log(connection, 'Found hover type');
				return {
					contents: [
						`PHPStan: \`${type.typeDescription} $${type.name}\``,
					],
				};
			}
		}

		void log(connection, 'Hovering, no type found');

		return null;
	};
}

export class HoverProviderCheckHooks {
	private _operationMap: Map<
		string,
		{
			reportPath: string;
			sourceFilePath: string;
		}
	> = new Map();
	private _reports: Map<string, FileReport | null> = new Map();

	private async _getFileReport(uri: string): Promise<FileReport | null> {
		if (!this._operationMap.has(uri)) {
			return null;
		}
		const match = this._operationMap.get(uri)!;
		this._operationMap.delete(uri);
		try {
			const file = await fs.readFile(match.reportPath, {
				encoding: 'utf-8',
			});
			const parsed = JSON.parse(file) as ReporterFile;
			return parsed[match.sourceFilePath];
		} catch (e) {
			return null;
		}
	}

	private async _getConfigFile(
		tmpDir: DirectoryResult,
		userConfigFile: string
	): Promise<string> {
		const neonFileContent = (
			await fs.readFile(NEON_FILE, {
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
		uri: string,
		filePath: string,
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
			autoloadFileContent += `require_once "${userAutoloadFile}";\n`;
		}
		autoloadFileContent += `require_once "${treeFetcherTmpFilePath}";`;
		await fs.writeFile(autoloadFilePath, autoloadFileContent, {
			encoding: 'utf-8',
		});

		this._operationMap.set(uri, {
			reportPath: treeFetcherReportedFilePath,
			sourceFilePath: filePath,
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

	public getFileReport(uri: string): FileReport | null | undefined {
		return this._reports.get(uri);
	}

	public async transformArgs(
		config: CheckConfig,
		args: string[],
		uri: string,
		filePath: string,
		disposables: Disposable[]
	): Promise<string[]> {
		const tmpDir = await tmp.dir();
		disposables.push(
			Disposable.create(() => {
				void fs.rm(tmpDir.path, { recursive: true });
			})
		);

		const userAutoloadFile = this._findArg(config, '-a', '--autoload-file');

		const autoloadFile = await this._getAutoloadFile(
			tmpDir,
			uri,
			filePath,
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

	public async onCheckDone(uri: string): Promise<void> {
		const report = await this._getFileReport(uri);
		this._reports.set(uri, report);
	}
}
