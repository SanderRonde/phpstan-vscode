import type {
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { readyNotification } from './lib/notificationChannels';
import { log, registerLogMessager } from './lib/log';
import { registerListeners } from './lib/commands';
import type { ExtensionContext } from 'vscode';
import { StatusBar } from './lib/statusBar';
import { Watcher } from './lib/watcher';
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
				execArgv: ['--nolazy', '--inspect=6009', '--inspect-brk'],
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
				'**/*.php',
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
	log('Initializing PHPStan extension');
	const client = await startLanguageServer(context);
	const statusBar = new StatusBar(context, client);
	const watcher = new Watcher(client);

	registerListeners(context, client);
	registerLogMessager(context, client);
	context.subscriptions.push(statusBar, watcher);

	context.subscriptions.push(
		client.onNotification(readyNotification, ({ ready }) => {
			if (ready) {
				watcher.watch(true);
			}
		})
	);
	log('Initializing done');
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
