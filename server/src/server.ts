/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
	createConnection,
	ProposedFeatures,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import { createDiagnosticsProvider } from './lib/diagnosticsProvider';
import { ConfigurationManager } from './lib/phpstan/configManager';
import { createHoverProvider } from './providers/hoverProvider';
import { readyNotification } from './lib/notificationChannels';
import type { Disposable } from 'vscode-languageserver/node';
import { ProviderCheckHooks } from './providers/shared';
import type { ProviderArgs } from './providers/shared';
import { SPAWN_ARGS } from '../../shared/constants';
import { log, SERVER_PREFIX } from './lib/log';
import { ProcessSpawner } from './lib/proc';
import { spawn } from 'child_process';
import { URI } from 'vscode-uri';

export type WorkspaceFolderGetter = () => URI | null;
export type PHPStanVersion = '1.*' | '2.*';

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

	const procSpawner = new ProcessSpawner(connection);
	const providerHooks = new ProviderCheckHooks(
		connection,
		getVersion,
		getWorkspaceFolder
	);
	const { phpstan, classConfig } = createDiagnosticsProvider(
		connection,
		onConnectionInitialized,
		providerHooks,
		disposables,
		getWorkspaceFolder,
		procSpawner,
		getVersion
	);
	const providerArgs: ProviderArgs = {
		connection,
		hooks: providerHooks,
		phpstan,
		getWorkspaceFolder,
		onConnectionInitialized,
	};
	connection.onHover(createHoverProvider(providerArgs));
	connection.listen();

	await onConnectionInitialized;
	void log(connection, SERVER_PREFIX, 'Language server ready');
	void connection.sendNotification(readyNotification, {
		ready: true,
	});

	// Test if we can get the PHPStan version
	const configManager = new ConfigurationManager(classConfig);
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
			proc.on('error', (err) => {
				void log(
					connection,
					SERVER_PREFIX,
					`Failed to get PHPStan version, is the path to your PHPStan binary correct? Error: ${err.message}`
				);
			});
			proc.on('close', (code) => {
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
