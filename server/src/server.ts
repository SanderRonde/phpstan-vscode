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
import {
	phpstanProNotification,
	statusBarNotification,
} from './lib/notificationChannels';
import { ConfigurationManager } from './lib/phpstan/configManager';
import { createHoverProvider } from './providers/hoverProvider';
import { PHPStanCheckManager } from './lib/phpstan/manager';
import type { ClassConfig } from './lib/phpstan/manager';
import { DocumentManager } from './lib/documentManager';
import { ProviderCheckHooks } from './providers/shared';
import type { ProviderArgs } from './providers/shared';
import { Commands } from '../../shared/commands/defs';
import { SPAWN_ARGS } from '../../shared/constants';
import { initRequest } from './lib/requestChannels';
import { launchPro } from './lib/phpstan/pro/pro';
import { getConfiguration } from './lib/config';
import { log, SERVER_PREFIX } from './lib/log';
import { StatusBar } from './lib/statusBar';
import { ProcessSpawner } from './lib/proc';
import { wait } from '../../shared/util';
import { Watcher } from './lib/watcher';
import { spawn } from 'child_process';
import { URI } from 'vscode-uri';

export type PHPStanVersion = '1.*' | '2.*';

function getClassConfig(
	connection: _Connection,
	workspaceFolder: PromisedValue<URI | null>,
	version: PromisedValue<PHPStanVersion | null>,
	documentManager: DocumentManager,
	extensionPath: PromisedValue<URI>
): ClassConfig {
	const procSpawner = new ProcessSpawner(connection);
	const providerHooks = new ProviderCheckHooks(
		connection,
		version,
		workspaceFolder,
		extensionPath
	);

	const statusBar = new StatusBar(connection);
	return {
		statusBar,
		connection,
		workspaceFolder: workspaceFolder,
		documents: documentManager,
		hooks: {
			provider: providerHooks,
		},
		procSpawner,
		version,
	};
}

interface StartReturn {
	hoverProvider: ServerRequestHandler<
		HoverParams,
		Hover | undefined | null,
		never,
		void
	> | null;
}

function startIntegratedChecker(
	classConfig: ClassConfig,
	connection: _Connection,
	disposables: Disposable[],
	onConnectionInitialized: Promise<void>,
	workspaceFolder: PromisedValue<URI | null>,
	startedAt: PromisedValue<Date>
): StartReturn {
	const phpstan = new PHPStanCheckManager(classConfig);
	const watcher = new Watcher({
		connection,
		phpstan,
		onConnectionInitialized,
		workspaceFolder: workspaceFolder,
	});

	classConfig.documents.setWatcher(watcher);

	disposables.push(phpstan, watcher);

	const providerArgs: ProviderArgs = {
		connection,
		hooks: classConfig.hooks.provider,
		phpstan,
		workspaceFolder: workspaceFolder,
		onConnectionInitialized,
		documents: classConfig.documents,
	};

	void (async () => {
		const startedAtTime = await startedAt.get();
		const serverLiveFor = Date.now() - startedAtTime.getTime();
		// Wait a while after start with checking so as to now tax the system too much
		await wait(Math.max(5000 - serverLiveFor, 0));
		void phpstan.checkProject();
	})();

	return {
		hoverProvider: createHoverProvider(providerArgs),
	};
}

async function startPro(
	classConfig: ClassConfig,
	connection: _Connection,
	disposables: Disposable[],
	onConnectionInitialized: Promise<void>,
	workspaceFolder: PromisedValue<URI | null>
): Promise<StartReturn> {
	if (!(await getConfiguration(connection, workspaceFolder)).enabled) {
		void log(
			connection,
			SERVER_PREFIX,
			'Not starting pro since extension has been disabled'
		);
		return {
			hoverProvider: null,
		};
	}

	void connection.sendNotification(statusBarNotification, {
		type: 'fallback',
		text: 'PHPStan Pro starting...',
	});
	const pro = await launchPro(connection, workspaceFolder, classConfig);
	if (!pro.success()) {
		void connection.window.showErrorMessage(
			`Failed to start PHPStan Pro: ${pro.error ?? '?'}`
		);
		void connection.sendNotification(statusBarNotification, {
			type: 'fallback',
			text: undefined,
		});
	} else if (!(await pro.value.getPort())) {
		void connection.window.showErrorMessage(
			'Failed to find PHPStan Pro port'
		);
		void connection.sendNotification(statusBarNotification, {
			type: 'fallback',
			text: undefined,
		});
	} else {
		disposables.push(pro.value);
		const port = (await pro.value.getPort())!;
		void connection.sendNotification(phpstanProNotification, {
			type: 'setPort',
			port: port,
		});
		if (!(await pro.value.isLoggedIn())) {
			void connection.sendNotification(phpstanProNotification, {
				type: 'requireLogin',
			});
		}
		void connection.sendNotification(statusBarNotification, {
			type: 'fallback',
			text: 'PHPStan Pro running',
			command: Commands.OPEN_PHPSTAN_PRO,
		});
	}

	const providerArgs: ProviderArgs = {
		connection,
		hooks: classConfig.hooks.provider,
		workspaceFolder: workspaceFolder,
		onConnectionInitialized,
		documents: classConfig.documents,
	};

	return {
		hoverProvider: createHoverProvider(providerArgs),
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
	const workspaceFolder = new PromisedValue<URI | null>();
	const version = new PromisedValue<PHPStanVersion | null>();
	const extensionPath = new PromisedValue<URI>();

	connection.onInitialize((params) => {
		const uri = params.workspaceFolders?.[0].uri;
		workspaceFolder.set(uri ? URI.parse(uri) : null);
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

	const hoverProvider = new PromisedValue<
		ServerRequestHandler<HoverParams, Hover | undefined | null, never, void>
	>();
	connection.onHover(async (...args) => {
		if (hoverProvider.isSet()) {
			const handler = await hoverProvider.get();
			return handler(...args);
		}
		return null;
	});
	connection.listen();

	await onConnectionInitialized;
	void log(connection, SERVER_PREFIX, 'Language server ready');
	const extensionStartedAt = new PromisedValue<Date>();
	void connection
		.sendRequest(initRequest, { ready: true })
		.then((response) => {
			extensionStartedAt.set(new Date(response.startedAt));
			extensionPath.set(URI.parse(response.extensionPath));
		});

	const config = await getConfiguration(connection, workspaceFolder);
	const documentManager = new DocumentManager(connection);
	disposables.push(documentManager);
	const classConfig = getClassConfig(
		connection,
		workspaceFolder,
		version,
		documentManager,
		extensionPath
	);
	void getPHPStanVersion(classConfig, disposables);

	const { hoverProvider: _hoverProvider } = config.pro
		? await startPro(
				classConfig,
				connection,
				disposables,
				onConnectionInitialized,
				workspaceFolder
		  )
		: startIntegratedChecker(
				classConfig,
				connection,
				disposables,
				onConnectionInitialized,
				workspaceFolder,
				extensionStartedAt
		  );
	if (_hoverProvider) {
		hoverProvider.set(_hoverProvider);
	}
}

async function getPHPStanVersion(
	classConfig: ClassConfig,
	disposables: Disposable[]
): Promise<void> {
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
				if (code === 0) {
					void log(
						classConfig.connection,
						SERVER_PREFIX,
						`PHPStan version: ${data}`
					);

					const versionMatch = /(\d+)\.(\d+)\.(\d+)/.exec(data);
					if (!versionMatch) {
						return;
					}

					const [, major] = versionMatch;
					if (major === '2') {
						classConfig.version.set('2.*');
					} else if (major === '1') {
						classConfig.version.set('1.*');
					}
				}
			});
		}
	}
}

export class PromisedValue<V> {
	private _resolve!: (value: V) => void;
	private readonly _promise: Promise<V>;
	private _wasSet: boolean = false;

	public constructor() {
		this._promise = new Promise<V>((resolve) => {
			this._resolve = resolve;
		});
	}

	public set(value: V): void {
		this._resolve(value);
		this._wasSet = true;
	}

	public get(): Promise<V> {
		return this._promise;
	}

	public isSet(): boolean {
		return this._wasSet;
	}
}

void main();
