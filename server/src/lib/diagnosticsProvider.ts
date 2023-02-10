import type { Disposable, _Connection } from 'vscode-languageserver';
import type { ProviderCheckHooks } from '../providers/shared';
import { PHPStanCheckManager } from './phpstan/manager';
import type { WorkspaceFolderGetter } from '../server';
import { DocumentManager } from './documentManager';
import type { ProcessSpawner } from './proc';
import { StatusBar } from './statusBar';
import { Watcher } from './watcher';

export function createDiagnosticsProvider(
	connection: _Connection,
	onConnectionInitialized: Promise<void>,
	hoverProviderHooks: ProviderCheckHooks,
	disposables: Disposable[],
	getWorkspaceFolder: WorkspaceFolderGetter,
	procSpawner: ProcessSpawner
): {
	phpstan: PHPStanCheckManager;
} {
	const statusBar = new StatusBar(connection);
	const phpstan = new PHPStanCheckManager({
		statusBar,
		connection,
		getWorkspaceFolder,
		get documents() {
			return documentManager;
		},
		hooks: {
			provider: hoverProviderHooks,
		},
		procSpawner,
	});
	const watcher = new Watcher({
		connection,
		phpstan,
		onConnectionInitialized,
		getWorkspaceFolder,
	});
	const documentManager: DocumentManager = new DocumentManager({
		connection,
		watcher,
	});

	disposables.push(phpstan, watcher, documentManager);

	return {
		phpstan,
	};
}
