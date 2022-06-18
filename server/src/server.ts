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
import type { Disposable } from 'vscode-languageserver/node';
import { createHoverProvider } from './lib/hoverProvider';
import { URI } from 'vscode-uri';

async function main(): Promise<void> {
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
		connection.console.log(
			`[Server(${
				process.pid
			}) ${workspaceFolder!}] Started and initialize received`
		);
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
	const { phpstan } = await createDiagnosticsProvider(
		connection,
		disposables,
		getWorkspaceFolder
	);
	connection.onHover(createHoverProvider(phpstan, getWorkspaceFolder));
	connection.listen();
}

void main();
