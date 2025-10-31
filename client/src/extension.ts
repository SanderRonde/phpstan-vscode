import { ConfigResolveLanguageStatus } from './notificationReceivers/configResolveLanguageStatus';
import {
	getInstallationConfig,
	writeInstallationConfig,
} from './lib/installationConfig';
import type {
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';
import {
	createOutputChannel,
	SERVER_PREFIX,
	log,
	CLIENT_PREFIX,
} from './lib/log';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { debug, initDebugReceiver } from './notificationReceivers/debug';
import { registerEditorConfigurationListener } from './lib/editorConfig';
import { DocumentManager } from './notificationSenders/documentManager';
import { ErrorManager } from './notificationReceivers/errorManager';
import { ZombieKiller } from './notificationReceivers/zombieKiller';
import { PHPStanProManager } from './notificationReceivers/pro';
import { StatusBar } from './notificationReceivers/statusBar';
import type { ExtensionContext, OutputChannel } from 'vscode';
import { PromisedValue } from '../../server/src/lib/types';
import { initRequest } from './lib/requestChannels';
import { registerListeners } from './lib/commands';
import { window, workspace } from 'vscode';
import { INSPECT_BRK } from './lib/dev';
import * as path from 'path';

let client: LanguageClient | null = null;
async function startLanguageServer(
	context: ExtensionContext,
	outputChannel: OutputChannel
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
		outputChannel,
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
	log(context, CLIENT_PREFIX, 'Initializing PHPStan extension');
	debug('lifecycle', 'Initializing PHPStan extension');
	const outputChannel = createOutputChannel();

	const client = await startLanguageServer(context, outputChannel);
	initDebugReceiver(client);
	const statusBar = new StatusBar(context, client);
	const watcher = new DocumentManager(client);
	const errorManager = new ErrorManager(client);
	const proManager = new PHPStanProManager(client);
	const zombieKiller = new ZombieKiller(client, context);
	const languageServerReady = new PromisedValue<boolean>();
	const configResolveLanguageStatus = new ConfigResolveLanguageStatus(
		context,
		client,
		languageServerReady
	);

	registerListeners(
		context,
		client,
		errorManager,
		proManager,
		outputChannel,
		configResolveLanguageStatus
	);
	registerEditorConfigurationListener(context, client);
	context.subscriptions.push(
		statusBar,
		watcher,
		errorManager,
		proManager,
		zombieKiller,
		configResolveLanguageStatus,
		outputChannel
	);

	let wasReady = false;
	const startedAt = Date.now();
	context.subscriptions.push(
		client.onRequest(initRequest, ({ ready }) => {
			if (ready) {
				languageServerReady.set(true);
				if (!wasReady) {
					// First time it's ready, start watching
					log(context, SERVER_PREFIX, 'Language server started');
					void watcher.watch();
				} else {
					// Language server was already alive but then died
					// and restarted. Clear local state that depends
					// on language server.
					log(context, SERVER_PREFIX, 'Language server restarted...');
					statusBar.clearAllRunning();
				}
				wasReady = true;
			}

			return Promise.resolve({
				extensionPath: context.extensionUri.toString(),
				startedAt: startedAt,
			});
		})
	);
	log(context, CLIENT_PREFIX, 'Initializing done');
	log(context, CLIENT_PREFIX, 'Showing one-time messages (if needed)');
	const installationConfig = await getInstallationConfig(context);
	const version = (context.extension.packageJSON as { version: string })
		.version;
	if (
		installationConfig.version === '2.2.26' &&
		installationConfig.version !== version
	) {
		// Updated! Show message
		void window.showInformationMessage(
			'PHPStan extension updated! Now always checks full project instead of a single file, which ensures it utilizes the cache. Uncached checks may take longer but performance, completeness & UX is better. Let me know if you have any feedback!'
		);
	}
	await writeInstallationConfig(context, {
		...installationConfig,
		version,
	});
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
