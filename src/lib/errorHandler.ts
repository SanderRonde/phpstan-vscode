import { Disposable } from 'vscode';
import * as vscode from 'vscode';

export class ErrorHandler implements Disposable {
	private _diagnosticCollection: vscode.DiagnosticCollection =
		vscode.languages.createDiagnosticCollection('error');

	public clearForDocument(document: vscode.TextDocument): void {
		this._diagnosticCollection.delete(document.uri);
	}

	public showForDocument(
		document: vscode.TextDocument,
		errors: vscode.Diagnostic[]
	): void {
		this._diagnosticCollection.set(
			document.uri,
			errors.map((error) => {
				return new vscode.Diagnostic(
					error.range,
					`PHPStan: ${error.message}`,
					error.severity
				);
			})
		);
	}

	public dispose(): void {
		this._diagnosticCollection.clear();
	}
}
