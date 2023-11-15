/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type {
	Disposable,
	Hover,
	HoverParams,
	ServerRequestHandler,
	_Connection,
} from 'vscode-languageserver/node';
import {
	createConnection,
	ProposedFeatures,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { ConfigurationManager } from './lib/phpstan/configManager';
import { createHoverProvider } from './providers/hoverProvider';
import { readyNotification } from './lib/notificationChannels';
import { PHPStanCheckManager } from './lib/phpstan/manager';
import type { ClassConfig } from './lib/phpstan/manager';
import { DocumentManager } from './lib/documentManager';
import { ProviderCheckHooks } from './providers/shared';
import type { ProviderArgs } from './providers/shared';
import { SPAWN_ARGS } from '../../shared/constants';
import { launchPro } from './lib/phpstan/pro/pro';
import { getConfiguration } from './lib/config';
import { log, SERVER_PREFIX } from './lib/log';
import { StatusBar } from './lib/statusBar';
import { ProcessSpawner } from './lib/proc';
import { Watcher } from './lib/watcher';
import { spawn } from 'child_process';
import { URI } from 'vscode-uri';

export type WorkspaceFolderGetter = () => URI | null;
export type PHPStanVersion = '1.*' | '2.*';

function getClassConfig(
	connection: _Connection,
	getWorkspaceFolder: WorkspaceFolderGetter,
	getVersion: () => PHPStanVersion | null,
	getDocumentManager: () => DocumentManager
): ClassConfig {
	const procSpawner = new ProcessSpawner(connection);
	const providerHooks = new ProviderCheckHooks(
		connection,
		getVersion,
		getWorkspaceFolder
	);

	const statusBar = new StatusBar(connection);
	return {
		statusBar,
		connection,
		getWorkspaceFolder,
		get documents() {
			return getDocumentManager();
		},
		hooks: {
			provider: providerHooks,
		},
		procSpawner,
		getVersion,
	};
}

interface StartReturn {
	hoverProvider: ServerRequestHandler<
		HoverParams,
		Hover | undefined | null,
		never,
		void
	>;
	classConfig: ClassConfig;
}

function startIntegratedChecker(
	connection: _Connection,
	disposables: Disposable[],
	onConnectionInitialized: Promise<void>,
	getWorkspaceFolder: WorkspaceFolderGetter,
	getVersion: () => PHPStanVersion | null
): StartReturn {
	const providerHooks = new ProviderCheckHooks(
		connection,
		getVersion,
		getWorkspaceFolder
	);

	const classConfig = getClassConfig(
		connection,
		getWorkspaceFolder,
		getVersion,
		() => documentManager
	);
	const phpstan = new PHPStanCheckManager(classConfig);
	const watcher = new Watcher({
		connection,
		phpstan,
		onConnectionInitialized,
		getWorkspaceFolder,
	});
	const documentManager: DocumentManager = new DocumentManager({
		connection,
		watcher,
	});

	disposables.push(phpstan, watcher, documentManager);

	const providerArgs: ProviderArgs = {
		connection,
		hooks: providerHooks,
		phpstan,
		getWorkspaceFolder,
		onConnectionInitialized,
		documents: classConfig.documents,
	};

	return {
		hoverProvider: createHoverProvider(providerArgs),
		classConfig,
	};
}

async function startPro(
	connection: _Connection,
	onConnectionInitialized: Promise<void>,
	getWorkspaceFolder: WorkspaceFolderGetter,
	getVersion: () => PHPStanVersion | null
): Promise<StartReturn> {
	const providerHooks = new ProviderCheckHooks(
		connection,
		getVersion,
		getWorkspaceFolder
	);

	const classConfig = getClassConfig(
		connection,
		getWorkspaceFolder,
		getVersion,
		() => documentManager
	);
	const documentManager: DocumentManager = new DocumentManager({
		connection,
	});

	const pro = await launchPro(connection, getWorkspaceFolder, classConfig);
	if (!pro.success()) {
		// TODO:(sander) error!
		void connection.sendNotification(readyNotification, {
			ready: true,
		});
	} else {
		// TODO:(sander) success
	}

	const providerArgs: ProviderArgs = {
		connection,
		hooks: providerHooks,
		getWorkspaceFolder,
		onConnectionInitialized,
		documents: classConfig.documents,
	};

	return {
		hoverProvider: createHoverProvider(providerArgs),
		classConfig,
	};
}

async function main(): Promise<void> {
	// Creates the LSP connection
	const connection = createConnection(ProposedFeatures.all);
	const disposables: Disposable[] = [];
	connection.onExit(() => {
		disposables.forEach((d) => void d.dispose());
	});
	const onConnectionInitialized = new Promise<void>((resolve) => {
		connection.onInitialized(() => {
			resolve();
		});
	});

	// The workspace folder this server is operating on
	let workspaceFolder: URI | null;
	const getWorkspaceFolder = (): URI | null => workspaceFolder;
	let version: PHPStanVersion | null = null;
	const getVersion = (): PHPStanVersion | null => version;

	connection.onInitialize((params) => {
		const uri = params.workspaceFolders?.[0].uri;
		workspaceFolder = uri ? URI.parse(uri) : null;
		return {
			capabilities: {
				textDocumentSync: {
					openClose: true,
					save: true,
					change: TextDocumentSyncKind.Full,
				},
				hoverProvider: true,
			},
		};
	});

	let hoverProvider: ServerRequestHandler<
		HoverParams,
		Hover | undefined | null,
		never,
		void
	> = () => null;
	connection.onHover(hoverProvider);
	connection.listen();

	await onConnectionInitialized;
	void log(connection, SERVER_PREFIX, 'Language server ready');
	void connection.sendNotification(readyNotification, {
		ready: true,
	});

	const config = await getConfiguration(connection, getWorkspaceFolder);
	const { classConfig, hoverProvider: _hoverProvider } = config.pro
		? await startPro(
				connection,
				onConnectionInitialized,
				getWorkspaceFolder,
				getVersion
		  )
		: startIntegratedChecker(
				connection,
				disposables,
				onConnectionInitialized,
				getWorkspaceFolder,
				getVersion
		  );
	hoverProvider = _hoverProvider;

	// Test if we can get the PHPStan version
	const configManager = new ConfigurationManager(classConfig);
	disposables.push(configManager);
	const cwd = await configManager.getCwd();
	if (cwd) {
		const binConfig = await configManager.getBinConfig(cwd);
		const binPath = binConfig?.binCmd ?? binConfig?.binPath;
		if (binPath) {
			const proc = spawn(binPath, ['--version'], {
				...SPAWN_ARGS,
				cwd: cwd,
			});

			let data = '';
			proc.stdout.on('data', (chunk) => {
				data += chunk;
			});
			proc.stderr.on('data', (chunk) => {
				data += chunk;
			});
			proc.on('close', (code) => {
				console.log(code, data);
				if (code === 0) {
					void log(
						connection,
						SERVER_PREFIX,
						`PHPStan version: ${data}`
					);

					const versionMatch = /(\d+)\.(\d+)\.(\d+)/.exec(data);
					if (!versionMatch) {
						return;
					}

					const [, major] = versionMatch;
					if (major === '2') {
						version = '2.*';
					} else if (major === '1') {
						version = '1.*';
					}
				}
			});
		}
	}
}

void main();

// TODO:(sander) if pro is enabled, `getFileReport` shouldn't queue a check
