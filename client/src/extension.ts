import {
	createOutputChannel,
	SERVER_PREFIX,
	log,
	registerLogMessager,
	CLIENT_PREFIX,
} from './lib/log';
import {
	getInstallationConfig,
	writeInstallationConfig,
} from './lib/installationConfig';
import type {
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';
import { LanguageClient, TransportKind } from 'vscode-languageclient/node';
import { getConfiguration, registerConfigListeners } from './lib/config';
import { DocumentManager } from './lib/documentManager';
import { initRequest } from './lib/requestChannels';
import { registerListeners } from './lib/commands';
import { ErrorManager } from './lib/errorManager';
import type { ExtensionContext } from 'vscode';
import { PHPStanProManager } from './lib/pro';
import { StatusBar } from './lib/statusBar';
import { ProcessSpawner } from './lib/proc';
import { window, workspace } from 'vscode';
import { INSPECT_BRK } from './lib/dev';
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
	const proManager = new PHPStanProManager(client);

	registerListeners(context, client, errorManager, proManager);
	registerConfigListeners();
	registerLogMessager(context, client);
	context.subscriptions.push(
		statusBar,
		watcher,
		errorManager,
		procSpawner,
		proManager
	);

	let wasReady = false;
	const startedAt = Date.now();
	context.subscriptions.push(
		client.onRequest(initRequest, ({ ready }) => {
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

			return Promise.resolve({
				extensionPath: context.extensionUri.toString(),
				startedAt: startedAt,
			});
		})
	);
	log(CLIENT_PREFIX, 'Initializing done');

	void (async () => {
		if (
			workspace.workspaceFolders &&
			workspace.workspaceFolders?.length > 1 &&
			!getConfiguration().get('phpstan.suppressWorkspaceMessage')
		) {
			const SUPPRESS_OPTION = "Don't show again";
			const choice = await window.showWarningMessage(
				`PHPStan extension only supports single-workspace projects, it'll only use the first workspace folder (${workspace.workspaceFolders[0].name}`,
				SUPPRESS_OPTION
			);
			if (choice === SUPPRESS_OPTION) {
				await getConfiguration().update(
					'phpstan.suppressWorkspaceMessage',
					true
				);
			}
		}
	})();

	log(CLIENT_PREFIX, 'Showing one-time messages (if needed)');
	const installationConfig = await getInstallationConfig(context);
	const version = (context.extension.packageJSON as { version: string })
		.version;
	if (
		installationConfig.version === '2.2.26' &&
		installationConfig.version !== version
	) {
		// Updated! Show message
		void window.showInformationMessage(
			'PHPStan extension updated! Now always checks full project instead of a single file, which ensures it utilizes the cache. Uncached checks may take longer but performance & UX is better'
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
