/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
	createConnection,
	ProposedFeatures,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import {
	createHoverProvider,
	HoverProviderCheckHooks,
} from './lib/hoverProvider';
import { createDiagnosticsProvider } from './lib/diagnosticsProvider';
import { readyNotification } from './lib/notificationChannels';
import type { Disposable } from 'vscode-languageserver/node';
import { URI } from 'vscode-uri';
import { log } from './lib/log';

function main(): void {
	// Creates the LSP connection
	const connection = createConnection(ProposedFeatures.all);
	const disposables: Disposable[] = [];
	connection.onExit(() => {
		disposables.forEach((d) => void d.dispose());
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
					change: TextDocumentSyncKind.Full,
				},
				hoverProvider: true,
			},
		};
	});

	const hoverProviderHooks = new HoverProviderCheckHooks();
	const { phpstan } = createDiagnosticsProvider(
		connection,
		hoverProviderHooks,
		disposables,
		getWorkspaceFolder
	);
	connection.onHover(
		createHoverProvider(hoverProviderHooks, phpstan, getWorkspaceFolder)
	);
	connection.listen();

	disposables.push(
		connection.onInitialized(() => {
			void log(connection, 'Language server ready');
			void connection.sendNotification(readyNotification, {
				ready: true,
			});
		})
	);
}

main();
