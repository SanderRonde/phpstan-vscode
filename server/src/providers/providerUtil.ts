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
	docker,
	getPathMapper,
	toCheckablePromise,
	waitPeriodical,
} from '../../../shared/util';
import {
	ConfigurationManager,
	type CheckConfig,
} from '../lib/checkConfigManager';
import {
	getDockerEnvironment,
	getEditorConfiguration,
} from '../lib/editorConfig';
import type {
	WorkspaceFolders,
	PromisedValue,
	ClassConfig,
} from '../lib/types';
import type { CancellationToken, _Connection } from 'vscode-languageserver';
import type { PHPStanCheckManager } from '../lib/phpstan/checkManager';
import type { DocumentManager } from '../lib/documentManager';
import type { PHPStanVersion } from '../start/getVersion';
import { ResolvedPromisedValue } from '../lib/types';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import * as path from 'path';
import * as os from 'os';

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

type ConfigTarget =
	| {
			target: 'local';
			path: string;
	  }
	| {
			target: 'docker';
			path: string;
			containerName: string;
			dockerEnvironment: Record<string, string> | null;
	  };

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
			).showTypeOnHover;
		})();
	}

	public constructor(
		private readonly _connection: _Connection,
		private readonly _version: PromisedValue<PHPStanVersion | null>,
		private readonly _workspaceFolders: PromisedValue<WorkspaceFolders | null>,
		private readonly _extensionPath: PromisedValue<URI>
	) {}

	private async _getConfigTarget(): Promise<ConfigTarget | null> {
		const workspaceFolder = await this._workspaceFolders.get();
		if (!workspaceFolder) {
			return null;
		}

		const roots = Object.values(workspaceFolder.byName).map((root) =>
			root?.toString()
		);
		const folder = path.join('_config', basicHash(JSON.stringify(roots)));

		const configuration = await getEditorConfiguration({
			connection: this._connection,
			workspaceFolders: this._workspaceFolders,
			editorConfigOverride: new ResolvedPromisedValue({}),
		});
		if (configuration.dockerContainerName) {
			return {
				target: 'docker',
				path: path.join('/tmp/phpstan-vscode', folder),
				containerName: configuration.dockerContainerName,
				dockerEnvironment: await getDockerEnvironment({
					connection: this._connection,
					workspaceFolders: this._workspaceFolders,
				}),
			};
		}
		return {
			target: 'local',
			path: path.join((await this._extensionPath.get()).fsPath, folder),
		};
	}

	private _mapConfigTarget(
		configTarget: ConfigTarget,
		filePath: string
	): ConfigTarget {
		return {
			...configTarget,
			path: path.join(configTarget.path, filePath),
		};
	}

	private async _getFileReport(
		classConfig: ClassConfig
	): Promise<ProjectReport | null> {
		const configTarget = await this._getConfigTarget();
		if (!configTarget) {
			return null;
		}
		try {
			const file = await this._readFile(
				this._mapConfigTarget(configTarget, 'reported.json')
			);
			const report = JSON.parse(file) as ProjectReport;

			// Apply reverse path mapping
			const paths = (await getEditorConfiguration(classConfig)).paths;
			const workspaceRoot = (await classConfig.workspaceFolders.get())
				?.default?.fsPath;
			const pathMapper = getPathMapper(paths, workspaceRoot);

			const mappedReport: ProjectReport = {};
			for (const filePath in report) {
				mappedReport[pathMapper(filePath, true)] = report[filePath];
			}

			return mappedReport;
		} catch (e) {
			return null;
		}
	}

	private async _getConfigFile(
		configTarget: ConfigTarget,
		userConfigFile: string
	): Promise<ConfigTarget> {
		const templateFile =
			(await this._version.get())?.major === 2
				? PHPSTAN_2_NEON_FILE
				: PHPSTAN_1_NEON_FILE;
		const neonFileContent = (
			await fs.readFile(templateFile, {
				encoding: 'utf-8',
			})
		)
			.replace('../test/demo/phpstan.neon', userConfigFile)
			.replace('../test/cacheDir', path.join(configTarget.path, 'cache'));
		const tmpNeonFilePath = this._mapConfigTarget(
			configTarget,
			'config.neon'
		);
		await this._writeFile(tmpNeonFilePath, neonFileContent);

		return tmpNeonFilePath;
	}

	private async _getAutoloadFile(
		configTarget: ConfigTarget,
		userAutoloadFile: string | null
	): Promise<ConfigTarget> {
		const treeFetcherFileName = 'TreeFetcher.php';
		const autoloadFileName = 'autoload.php';
		const treeFetcherFileTarget = this._mapConfigTarget(
			configTarget,
			treeFetcherFileName
		);
		const autoloadFileTarget = this._mapConfigTarget(
			configTarget,
			autoloadFileName
		);

		const treeFetcherContent = (
			await fs.readFile(TREE_FETCHER_FILE, {
				encoding: 'utf-8',
			})
		).replace(
			'reported.json',
			path.join(configTarget.path, 'reported.json')
		);

		await this._mkdir(configTarget);
		await this._writeFile(treeFetcherFileTarget, treeFetcherContent);

		let autoloadFileContent = '<?php\n';
		if (userAutoloadFile) {
			autoloadFileContent += `chdir('${path.dirname(
				userAutoloadFile
			)}');\n`;
			autoloadFileContent += `require_once '${userAutoloadFile}';\n`;
		}
		autoloadFileContent += `require_once '${treeFetcherFileTarget.path}';`;
		// autoloadFileContent += `require_once '${DIAGNOSER_FILE}';`;
		await this._writeFile(autoloadFileTarget, autoloadFileContent);

		return autoloadFileTarget;
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

	private async _readFile(configTarget: ConfigTarget): Promise<string> {
		if (configTarget.target === 'local') {
			return fs.readFile(configTarget.path, {
				encoding: 'utf-8',
			});
		}
		return (
			await docker(
				['exec', configTarget.containerName, 'cat', configTarget.path],
				configTarget.dockerEnvironment
			)
		).stdout;
	}

	private async _mkdir(configTarget: ConfigTarget): Promise<void> {
		if (configTarget.target === 'local') {
			await fs.mkdir(configTarget.path, {
				recursive: true,
			});
		} else {
			await docker(
				[
					'exec',
					configTarget.containerName,
					'mkdir',
					'-p',
					configTarget.path,
				],
				configTarget.dockerEnvironment
			);
		}
	}

	private async _writeFile(
		configTarget: ConfigTarget,
		content: string
	): Promise<void> {
		if (configTarget.target === 'local') {
			await fs.writeFile(configTarget.path, content, {
				encoding: 'utf-8',
			});
		} else {
			// Write content to a temporary local file first
			const tmpDir = await fs.mkdtemp(
				path.join(os.tmpdir(), 'phpstan-vscode-')
			);
			const fileName = path.basename(configTarget.path);
			const tmpPath = path.join(tmpDir, fileName);
			await fs.mkdir(tmpPath, { recursive: true });
			await fs.writeFile(path.join(tmpPath, fileName), content, 'utf8');

			// Make sure target directory exists
			const targetDir = path.dirname(configTarget.path);
			await docker(
				['exec', configTarget.containerName, 'mkdir', '-p', targetDir],
				configTarget.dockerEnvironment
			);

			// Copy the file into the container
			await docker(
				[
					'cp',
					path.join(tmpPath, fileName),
					`${configTarget.containerName}:${configTarget.path}`,
				],
				configTarget.dockerEnvironment
			);

			// Clean up temp file
			await fs.rm(tmpDir, { recursive: true });
		}
	}

	public getProjectReport(): ProjectReport | null {
		return this._lastReport;
	}

	public clearReport(): void {
		this._lastReport = null;
	}

	public async transformArgs(
		checkConfig: CheckConfig,
		classConfig: ClassConfig,
		args: string[],
		operation: 'analyse' | 'diagnose'
	): Promise<string[]> {
		if (!(await this._lsEnabled) && operation !== 'diagnose') {
			return args;
		}

		const configTarget = await this._getConfigTarget();
		if (!configTarget) {
			return args;
		}

		await this._mkdir(configTarget);

		const userAutoloadFile = this._findArg(
			checkConfig,
			'-a',
			'--autoload-file'
		);
		const autoloadFilePath = await this._getAutoloadFile(
			configTarget,
			userAutoloadFile
		);

		args.push('-a', autoloadFilePath.path);
		if (checkConfig.configFile) {
			const workspaceFolders = await classConfig.workspaceFolders.get();
			const workspaceRoot =
				workspaceFolders?.getForPath(checkConfig.configFile)?.fsPath ??
				workspaceFolders?.default?.fsPath;

			const configFile = await this._getConfigFile(
				configTarget,
				await ConfigurationManager.applyPathMapping(
					classConfig,
					checkConfig.configFile,
					workspaceRoot
				)
			);
			args.push('-c', configFile.path);
		}
		return args;
	}

	public async onCheckDone(classConfig: ClassConfig): Promise<void> {
		if (!(await this._lsEnabled)) {
			return;
		}

		const report = await this._getFileReport(classConfig);
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
	return configuration.showTypeOnHover && configuration.enabled;
}
