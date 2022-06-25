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
import { createHoverProvider } from './providers/hoverProvider';
import { readyNotification } from './lib/notificationChannels';
import type { Disposable } from 'vscode-languageserver/node';
import { ProviderCheckHooks } from './providers/shared';
import { providerEnabled } from './lib/providerUtil';
import { URI } from 'vscode-uri';
import { log } from './lib/log';

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
	let workspaceFolder: string | null;
	const getWorkspaceFolder = (): string | null => workspaceFolder;

	connection.onInitialize((params) => {
		const uri = params.workspaceFolders?.[0].uri;
		workspaceFolder = uri ? URI.parse(uri).fsPath : null;
		return {
			capabilities: {
				textDocumentSync: {
					openClose: true,
					save: true,
					change: TextDocumentSyncKind.Full,
				},
				hoverProvider: true,
				completionProvider: {
					completionItem: {
						labelDetailsSupport: true,
					},
					triggerCharacters: ['$', '\\', '>', ':'],
				},
			},
		};
	});

	const providerHooks = new ProviderCheckHooks();
	const { phpstan } = createDiagnosticsProvider(
		connection,
		onConnectionInitialized,
		providerHooks,
		disposables,
		getWorkspaceFolder
	);
	const providersEnabled = providerEnabled(
		connection,
		onConnectionInitialized,
		disposables
	);
	const providerArgs = {
		connection,
		hooks: providerHooks,
		phpstan,
		getWorkspaceFolder,
		enabled: providersEnabled,
	};
	connection.onHover(createHoverProvider(providerArgs));
	connection.listen();

	await onConnectionInitialized;
	void log(connection, 'Language server ready');
	void connection.sendNotification(readyNotification, {
		ready: true,
	});
}

void main();
