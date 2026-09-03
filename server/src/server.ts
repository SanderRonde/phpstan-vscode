/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
	createConnection,
	DidChangeWorkspaceFoldersNotification,
	ProposedFeatures,
	TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import type {
	Disposable,
	Hover,
	HoverParams,
	ServerRequestHandler,
} from 'vscode-languageserver/node';

import {
	PromisedValue,
	ResolvedPromisedValue,
	type WorkspaceFolders,
} from './lib/types';
import { startIntegratedChecker } from './start/startIntegratedChecker';
import type { PHPStanCheckManager } from './lib/phpstan/checkManager';
import { ProviderCheckHooks } from './providers/providerUtil';
import type { DocumentManager } from './lib/documentManager';
import { listenClearCache } from './lib/phpstan/clearCache';
import { getEditorConfiguration } from './lib/editorConfig';
import type { PHPStanVersion } from './start/getVersion';
import { ConfigResolver } from './lib/configResolver';
import { initRequest } from './lib/requestChannels';
import { getVersion } from './start/getVersion';
import type { ClassConfig } from './lib/types';
import { log, SERVER_PREFIX } from './lib/log';
import { startPro } from './start/startPro';
import { StatusBar } from './lib/statusBar';
import { listenTest } from './lib/test';
import { URI } from 'vscode-uri';
import * as path from 'path';

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
	const extensionStartedAt = new PromisedValue<Date>();

	connection.onInitialize((params) => {
		const folders = (params.workspaceFolders ?? []).map((folder) => ({
			name: folder.name,
			uri: URI.parse(folder.uri),
		}));

		if (folders.length > 0) {
			// `folders` is mutated in place by the change listener below so
			// `getForPath`/`byName` stay live as folders are added/removed
			// after startup (e.g. "Add Folder to Workspace..."), since
			// `PromisedValue` only lets us call `.set()` once.
			const initializedFolders: WorkspaceFolders = {
				byName: {},
				getForPath: (filePath: string) => {
					if (!path.isAbsolute(filePath)) {
						return undefined;
					}
					for (const folder of folders) {
						if (filePath.startsWith(folder.uri.fsPath)) {
							return folder.uri;
						}
					}
					return undefined;
				},
			};

			const syncFolders = (): void => {
				for (const name of Object.keys(initializedFolders.byName)) {
					delete initializedFolders.byName[name];
				}
				for (const folder of folders) {
					initializedFolders.byName[folder.name] = folder.uri;
				}
				// Only treat a folder as the unambiguous default when it's
				// the only one open; with multiple folders, callers must
				// resolve per-file via `getForPath` instead of guessing.
				initializedFolders.default =
					folders.length === 1 ? folders[0].uri : undefined;
			};
			syncFolders();
			workspaceFolders.set(initializedFolders);

			// Use the raw notification handler instead of
			// `connection.workspace.onDidChangeWorkspaceFolders`: that
			// getter assumes dynamic `client/registerCapability`
			// support, which this project's client doesn't implement.
			connection.onNotification(
				DidChangeWorkspaceFoldersNotification.type,
				({ event }) => {
					for (const removed of event.removed) {
						const removedUri = URI.parse(removed.uri).toString();
						const index = folders.findIndex(
							(folder) => folder.uri.toString() === removedUri
						);
						if (index !== -1) {
							folders.splice(index, 1);
						}
					}
					for (const added of event.added) {
						folders.push({
							name: added.name,
							uri: URI.parse(added.uri),
						});
					}
					syncFolders();
				}
			);
		} else {
			workspaceFolders.set(null);
		}
		return {
			capabilities: {
				workspace: {
					workspaceFolders: {
						supported: true,
						changeNotifications: true,
					},
				},
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
	log(SERVER_PREFIX, 'Language server ready');

	// Create required values
	const editorConfigOverride: ClassConfig['editorConfigOverride'] =
		new ResolvedPromisedValue({});
	const editorConfiguration = await getEditorConfiguration({
		connection,
		workspaceFolders,
		editorConfigOverride: editorConfigOverride,
	});

	const providerHooks = new ProviderCheckHooks(
		connection,
		version,
		workspaceFolders,
		extensionPath
	);
	const statusBar = new StatusBar(connection);
	const classConfig: ClassConfig = {
		statusBar,
		connection,
		workspaceFolders,
		hooks: {
			provider: providerHooks,
		},
		version,
		editorConfigOverride: editorConfigOverride,
	};
	const configResolver = new ConfigResolver(classConfig);
	disposables.push(configResolver);

	// Check version
	void getVersion(classConfig).then((result) => {
		// Always resolve, even on failure, so anything awaiting `version` doesn't hang forever
		classConfig.version.set(result.success ? result.version : null);
	});

	let result: StartResult;
	if (editorConfiguration.pro) {
		result = await startPro(
			classConfig,
			configResolver,
			connection,
			disposables,
			onConnectionInitialized,
			workspaceFolders
		);
	} else {
		result = startIntegratedChecker(
			classConfig,
			configResolver,
			connection,
			disposables,
			onConnectionInitialized,
			workspaceFolders,
			extensionStartedAt
		);
	}
	hoverProvider.set(result.hoverProvider);
	disposables.push(
		listenTest(
			connection,
			classConfig,
			result.documentManager,
			configResolver,
			result.checkManager
		),
		listenClearCache(
			connection,
			classConfig,
			configResolver,
			result.checkManager,
			onConnectionInitialized
		)
	);

	void connection
		.sendRequest(initRequest, { ready: true })
		.then((response) => {
			extensionStartedAt.set(new Date(response.startedAt));
			extensionPath.set(URI.parse(response.extensionPath));
		});
}

export interface StartResult {
	hoverProvider: ServerRequestHandler<
		HoverParams,
		Hover | undefined | null,
		never,
		void
	>;
	documentManager: DocumentManager;
	checkManager?: PHPStanCheckManager;
}

void main().catch((err: unknown) => {
	log(
		SERVER_PREFIX,
		`Server crashed: ${err instanceof Error && err.stack ? err.stack : String(err)}`
	);
});
process.on('uncaughtException', (err) => {
	log(
		SERVER_PREFIX,
		`Uncaught Exception: ${err instanceof Error && err.stack ? err.stack : String(err)}`
	);
});
process.on('unhandledRejection', (reason) => {
	log(
		SERVER_PREFIX,
		`Unhandled Rejection: ${reason instanceof Error && reason.stack ? reason.stack : String(reason)}`
	);
});
