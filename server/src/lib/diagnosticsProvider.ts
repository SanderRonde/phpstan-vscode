import type { PHPStanVersion, WorkspaceFolderGetter } from '../server';
import type { Disposable, _Connection } from 'vscode-languageserver';
import type { ProviderCheckHooks } from '../providers/shared';
import { PHPStanCheckManager } from './phpstan/manager';
import type { ClassConfig } from './phpstan/manager';
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
	procSpawner: ProcessSpawner,
	getVersion: () => PHPStanVersion | null
): {
	phpstan: PHPStanCheckManager;
	classConfig: ClassConfig;
} {
	const statusBar = new StatusBar(connection);
	const classConfig: ClassConfig = {
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
		getVersion,
	};
	const phpstan = new PHPStanCheckManager(classConfig);
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
		classConfig,
	};
}
