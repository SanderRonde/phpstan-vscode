import {
	createOutputChannel,
	SERVER_PREFIX,
	log,
	registerLogMessager,
	CLIENT_PREFIX,
} from './lib/log';
import type {
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { readyNotification } from './lib/notificationChannels';
import { DocumentManager } from './lib/documentManager';
import { registerConfigListeners } from './lib/config';
import { registerListeners } from './lib/commands';
import { ErrorManager } from './lib/errorManager';
import type { ExtensionContext } from 'vscode';
import { StatusBar } from './lib/statusBar';
import { ProcessSpawner } from './lib/proc';
import { INSPECT_BRK } from './lib/dev';
import { workspace } from 'vscode';
import * as path from 'path';

let client: LanguageClient | null = null;
async function startLanguageServer(
	context: ExtensionContext
): Promise<LanguageClient> {
	const serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
	const argv = ['--nolazy', '--inspect=6009'];
	if (INSPECT_BRK) {
		argv.push('--inspect-brk');
	}
	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.ipc,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: {
				execArgv: argv,
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
	log(CLIENT_PREFIX, 'Initializing PHPStan extension');
	createOutputChannel();
	const client = await startLanguageServer(context);
	const statusBar = new StatusBar(context, client);
	const watcher = new DocumentManager(client);
	const errorManager = new ErrorManager(client);
	const procSpawner = new ProcessSpawner(client, context);

	registerListeners(context, client);
	registerConfigListeners();
	registerLogMessager(context, client);
	context.subscriptions.push(statusBar, watcher, errorManager, procSpawner);

	let wasReady = false;
	context.subscriptions.push(
		client.onNotification(readyNotification, ({ ready }) => {
			if (ready) {
				if (!wasReady) {
					// First time it's ready, start watching
					log(SERVER_PREFIX, 'Language server started');
					void watcher.watch();
				} else {
					// Language server was already alive but then died
					// and restarted. Clear local state that depends
					// on language server.
					log(SERVER_PREFIX, 'Language server restarted...');
					statusBar.clearAllRunning();
				}
				wasReady = true;
			}
		})
	);
	log(CLIENT_PREFIX, 'Initializing done');
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
