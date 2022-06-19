import type { Disposable, _Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { PHPStanCheckManager } from './phpstan/manager';
import { TextDocuments } from 'vscode-languageserver';
import { StatusBar } from './statusBar';
import { Watcher } from './watcher';

export function createDiagnosticsProvider(
	connection: _Connection,
	disposables: Disposable[],
	getWorkspaceFolder: () => string | null
): {
	phpstan: PHPStanCheckManager;
} {
	// Create a manager for open text documents
	const documents: TextDocuments<TextDocument> = new TextDocuments(
		TextDocument
	);

	const statusBar = new StatusBar(connection);
	const phpstan = new PHPStanCheckManager({
		statusBar,
		connection,
		getWorkspaceFolder,
		documents,
	});
	const watcher = new Watcher({
		connection,
		phpstan,
	});

	disposables.push(phpstan, watcher);
	disposables.push(documents.listen(connection));
	disposables.push(
		connection.onInitialized(() => {
			void watcher.watch();
		})
	);

	return {
		phpstan,
	};
}
