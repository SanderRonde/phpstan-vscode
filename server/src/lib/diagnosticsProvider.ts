import type { Disposable, _Connection } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver';
import { StatusBar } from './statusBar';
import { PHPStan } from './phpstan';
import { Watcher } from './watcher';

export function createDiagnosticsProvider(
	connection: _Connection,
	disposables: Disposable[],
	getWorkspaceFolder: () => string | null
): {
	phpstan: PHPStan;
} {
	// Create a manager for open text documents
	const documents: TextDocuments<TextDocument> = new TextDocuments(
		TextDocument
	);

	const statusBar = new StatusBar(connection);
	const phpstan = new PHPStan({
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
