/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import type {
	Disposable,
	Hover,
	HoverParams,
	ServerRequestHandler,
} from 'vscode-languageserver/node';
import {
	createConnection,
	ProposedFeatures,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';

import { startIntegratedChecker } from './start/startIntegratedChecker';
import { PromisedValue, type WorkspaceFolders } from './lib/types';
import { ProviderCheckHooks } from './providers/providerUtil';
import { getEditorConfiguration } from './lib/editorConfig';
import type { PHPStanVersion } from './start/getVersion';
import { initRequest } from './lib/requestChannels';
import { ProcessSpawner } from './lib/procSpawner';
import { getVersion } from './start/getVersion';
import { log, SERVER_PREFIX } from './lib/log';
import { startPro } from './start/startPro';
import { StatusBar } from './lib/statusBar';
import { URI } from 'vscode-uri';

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

	// Get the workspace folder this server is operating on
	const workspaceFolders = new PromisedValue<WorkspaceFolders | null>();
	const version = new PromisedValue<PHPStanVersion | null>();
	const extensionPath = new PromisedValue<URI>();

	connection.onInitialize((params) => {
		const uri = params.workspaceFolders?.[0].uri;
		if (uri) {
			const initializedFolders: WorkspaceFolders = {
				default: URI.parse(uri),
			};
			for (const folder of params.workspaceFolders ?? []) {
				initializedFolders[folder.name] = URI.parse(folder.uri);
			}
			workspaceFolders.set(initializedFolders);
		}
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

	// Create required values
	const editorConfiguration = await getEditorConfiguration({
		connection,
		workspaceFolders,
	});
	const procSpawner = new ProcessSpawner(connection);
	const providerHooks = new ProviderCheckHooks(
		connection,
		version,
		workspaceFolders,
		extensionPath
	);

	const statusBar = new StatusBar(connection);
	const classConfig = {
		statusBar,
		connection,
		workspaceFolders,
		hooks: {
			provider: providerHooks,
		},
		procSpawner,
		version,
	};

	// Check version
	void getVersion(classConfig).then((version) =>
		classConfig.version.set(version)
	);

	// Start actual checker
	const { hoverProvider: _hoverProvider } = editorConfiguration.pro
		? await startPro(
				classConfig,
				connection,
				disposables,
				onConnectionInitialized,
				workspaceFolders
			)
		: startIntegratedChecker(
				classConfig,
				connection,
				disposables,
				onConnectionInitialized,
				workspaceFolders,
				extensionStartedAt
			);
	if (_hoverProvider) {
		hoverProvider.set(_hoverProvider);
	}
}

void main();
