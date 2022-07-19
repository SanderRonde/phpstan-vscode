import type { PHPStanError } from '../../../shared/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import { errorNotification } from './notificationChannels';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';

export class ErrorManager implements Disposable {
	private readonly _diagnosticsCollection: vscode.DiagnosticCollection;
	private readonly _errors: Map<string, PHPStanError[]> = new Map();
	private _disposables: Disposable[] = [];

	public constructor(client: LanguageClient) {
		this._disposables.push(
			client.onNotification(errorNotification, (params) => {
				if (params.isProjectCheck) {
					this._errors.clear();
					this._diagnosticsCollection.clear();
				}
				for (const uri in params.diagnostics) {
					this._errors.set(uri, params.diagnostics[uri]);
					this._showErrors(uri, params.diagnostics[uri]);
				}
			})
		);
		this._diagnosticsCollection =
			vscode.languages.createDiagnosticCollection('PHPStan');
		this._disposables.push(this._diagnosticsCollection);
		this._disposables.push(
			vscode.workspace.onDidOpenTextDocument((e) => {
				if (this._errors.has(e.fileName)) {
					// Refresh, we might have some info on the chars
					this._showErrors(e.fileName, this._errors.get(e.fileName)!);
				}
			})
		);
	}

	private _getDiagnosticsForURI(
		uri: string,
		errors: PHPStanError[]
	): vscode.Diagnostic[] {
		return errors.map((error) => {
			const file = vscode.workspace.textDocuments.find(
				(doc) => doc.fileName === uri
			);

			const lineNumber = error.lineNumber - 1;

			if (!file) {
				// Can't match on content, just use 0-char offset
				return new vscode.Diagnostic(
					new vscode.Range(lineNumber, 0, lineNumber, 0),
					error.message,
					vscode.DiagnosticSeverity.Error
				);
			}

			// Get text range
			const fullLineText = file.getText().split('\n')[lineNumber];

			const { startChar, endChar } = (() => {
				const match = /^(\s*).*(\s*)$/.exec(fullLineText);
				if (match) {
					const [, leading, trailing] = match;
					return {
						startChar: leading.length,
						endChar: fullLineText.length - trailing.length,
					};
				}
				return {
					startChar: 0,
					endChar: fullLineText.length,
				};
			})();

			return new vscode.Diagnostic(
				new vscode.Range(lineNumber, startChar, lineNumber, endChar),
				error.message,
				vscode.DiagnosticSeverity.Error
			);
		});
	}

	private _showErrors(uri: string, errors: PHPStanError[]): void {
		const diagnostics = this._getDiagnosticsForURI(uri, errors);
		this._diagnosticsCollection.set(vscode.Uri.parse(uri), diagnostics);
	}

	public dispose(): void {
		this._diagnosticsCollection.dispose();
	}
}
