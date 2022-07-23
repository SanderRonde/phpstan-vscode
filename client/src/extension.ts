import type {
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { EXTENSION_PREFIX, log, registerLogMessager } from './lib/log';
import { readyNotification } from './lib/notificationChannels';
import { DocumentManager } from './lib/documentManager';
import { registerConfigListeners } from './lib/config';
import { log, registerLogMessager } from './lib/log';
import { registerListeners } from './lib/commands';
import { ErrorManager } from './lib/errorManager';
import type { ExtensionContext } from 'vscode';
import { StatusBar } from './lib/statusBar';
import { workspace } from 'vscode';
import * as path from 'path';

let client: LanguageClient | null = null;
async function startLanguageServer(
	context: ExtensionContext
): Promise<LanguageClient> {
	const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: {
				execArgv: ['--nolazy', '--inspect=6009'], // '--inspect-brk' Enable if you want to attach to the server
			},
		},
	};
	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{
				scheme: 'file',
				language: 'php',
			},
		],
		synchronize: {
			fileEvents: workspace.createFileSystemWatcher(
				'*.php',
				false,
				false,
				true
			),
		},
	};

	client = new LanguageClient(
		'phpstan',
		'PHPStan Language Server',
		serverOptions,
		clientOptions
	);

	await client.start();
	return client;
}

export async function activate(context: ExtensionContext): Promise<void> {
	log(EXTENSION_PREFIX, 'Initializing PHPStan extension');
	const client = await startLanguageServer(context);
	const statusBar = new StatusBar(context, client);
	const watcher = new DocumentManager(client);
	const errorManager = new ErrorManager(client);

	registerListeners(context, client);
	registerConfigListeners();
	registerLogMessager(context, client);
	context.subscriptions.push(statusBar, watcher, errorManager);

	context.subscriptions.push(
		client.onNotification(readyNotification, ({ ready }) => {
			if (ready) {
				void watcher.watch();
			}
		})
	);
	log(EXTENSION_PREFIX, 'Initializing done');
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
