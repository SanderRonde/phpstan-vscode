import type { LanguageClient } from 'vscode-languageclient/node';
import { errorNotification } from '../lib/notificationChannels';
import type { Disposable } from 'vscode';
import * as vscode from 'vscode';

interface PHPStanError {
	message: string;
	lineNumber: number | null;
	ignorable: boolean;
	identifier: string | null;
	tip: string | null;
}

export class ErrorManager implements Disposable, vscode.CodeActionProvider {
	private readonly _diagnosticsCollection: vscode.DiagnosticCollection;
	private _errors: {
		fileSpecificErrors: Map<string, PHPStanError[]>;
		notFileSpecificErrors: string[];
	} = {
		fileSpecificErrors: new Map(),
		notFileSpecificErrors: [],
	};
	// Making this a map ensures that equality is always preserved.
	// Making it a weakmap ensures we don't leak any memory.
	private readonly _diagnosticMap = new WeakMap<
		PHPStanError,
		vscode.Diagnostic
	>();
	private _disposables: Disposable[] = [];

	public constructor(client: LanguageClient) {
		this._disposables.push(
			client.onNotification(errorNotification, (params) => {
				this.clearErrors();
				for (const uri in params.diagnostics.fileSpecificErrors) {
					this._errors.fileSpecificErrors.set(
						uri,
						params.diagnostics.fileSpecificErrors[uri]
					);
					this._showErrors(
						uri,
						params.diagnostics.fileSpecificErrors[uri]
					);
				}
			})
		);
		this._diagnosticsCollection =
			vscode.languages.createDiagnosticCollection('PHPStan');
		this._disposables.push(this._diagnosticsCollection);

		let lastEditor: vscode.TextEditor | undefined = undefined;
		this._disposables.push(
			vscode.window.onDidChangeActiveTextEditor((editor) => {
				if (lastEditor) {
					this._showErrors(
						lastEditor.document.uri.toString(),
						this._errors.fileSpecificErrors.get(
							lastEditor.document.uri.toString()
						) ?? []
					);
				}

				if (editor) {
					this._showErrors(editor.document.uri.toString(), [
						...(this._errors.fileSpecificErrors.get(
							editor.document.uri.toString()
						) ?? []),
						...this._errors.notFileSpecificErrors.map(
							(message) => ({
								message,
								lineNumber: null,
								ignorable: false,
								identifier: null,
								tip: null,
							})
						),
					]);
				}
				lastEditor = editor;
			})
		);
		this._disposables.push(
			vscode.workspace.onDidOpenTextDocument((e) => {
				if (this._errors.fileSpecificErrors.has(e.fileName)) {
					// Refresh, we might have some info on the chars
					this._showErrors(
						e.fileName,
						this._errors.fileSpecificErrors.get(e.fileName)!
					);
				}
			})
		);
		this._disposables.push(
			vscode.languages.registerCodeActionsProvider('php', this, {
				providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
			})
		);
	}

	private _createDiagnostic(
		range: vscode.Range,
		error: PHPStanError
	): vscode.Diagnostic {
		if (this._diagnosticMap.has(error)) {
			const diagnostic = this._diagnosticMap.get(error)!;
			if (!diagnostic.range.isEqual(range)) {
				diagnostic.range = range;
			}
			return diagnostic;
		}

		const tip = error.tip
			? '\n💡 ' +
				error.tip
					.split('\n')
					.map((l) => l.trim())
					.join(' ')
			: '';

		const diagnostic = new vscode.Diagnostic(
			range,
			`${error.message || error.identifier || '<no message>'} ${tip}`
		);
		diagnostic.source = 'PHPStan';
		if (error.identifier) {
			diagnostic.code = {
				value: error.identifier,
				target: vscode.Uri.parse(
					`https://phpstan.org/error-identifiers/${error.identifier}`
				),
			};
		}

		this._diagnosticMap.set(error, diagnostic);
		return diagnostic;
	}

	private _getDiagnosticsForURI(
		uri: vscode.Uri,
		errors: PHPStanError[]
	): vscode.Diagnostic[] {
		return errors.map((error) => {
			const file = vscode.workspace.textDocuments.find(
				(doc) => doc.uri.toString() === uri.toString()
			);

			if (!error.lineNumber) {
				return this._createDiagnostic(
					new vscode.Range(0, 0, 0, 0),
					error
				);
			}

			const lineNumber = error.lineNumber - 1;

			if (!file) {
				// Can't match on content, just use 0-char offset
				return this._createDiagnostic(
					new vscode.Range(lineNumber, 0, lineNumber, 0),
					error
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

			return this._createDiagnostic(
				new vscode.Range(lineNumber, startChar, lineNumber, endChar),
				error
			);
		});
	}

	private _showErrors(uri: string, errors: PHPStanError[]): void {
		const parsedURI = vscode.Uri.parse(uri);
		const diagnostics = this._getDiagnosticsForURI(parsedURI, errors);
		this._diagnosticsCollection.set(parsedURI, diagnostics);
	}

	public async jumpToError(direction: 'next' | 'prev'): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}

		const diagnostisByUri: Record<string, readonly vscode.Diagnostic[]> =
			{};
		this._diagnosticsCollection.forEach((uri, diagnostics) => {
			diagnostisByUri[uri.toString()] = diagnostics;
		});

		const diagnosticsForFile =
			diagnostisByUri[editor.document.uri.toString()] ?? [];
		for (const diagnostic of diagnosticsForFile) {
			if (
				direction === 'next'
					? diagnostic.range.start.line > editor.selection.start.line
					: diagnostic.range.start.line < editor.selection.start.line
			) {
				editor.selection = new vscode.Selection(
					diagnostic.range.start,
					diagnostic.range.end
				);
				editor.revealRange(diagnostic.range);
				return;
			}
		}

		// Current file is done, move on to next/prev file
		const sortedURIs = Object.keys(diagnostisByUri).sort();
		const currentIndex = sortedURIs.indexOf(editor.document.uri.toString());
		const nextUri = (() => {
			if (direction === 'next') {
				return sortedURIs[currentIndex + 1] ?? sortedURIs[0];
			} else if (currentIndex === -1) {
				return sortedURIs[sortedURIs.length - 1];
			} else {
				return (
					sortedURIs[currentIndex - 1] ??
					sortedURIs[sortedURIs.length - 1]
				);
			}
		})();

		if (!nextUri) {
			await vscode.window.showInformationMessage('No more errors');
			return;
		}

		await vscode.commands.executeCommand(
			'vscode.open',
			vscode.Uri.parse(nextUri)
		);

		vscode.window.activeTextEditor!.selection = new vscode.Selection(
			diagnostisByUri[nextUri][0].range.start,
			diagnostisByUri[nextUri][0].range.end
		);
		vscode.window.activeTextEditor!.revealRange(
			diagnostisByUri[nextUri][0].range
		);
	}

	public provideCodeActions(
		document: vscode.TextDocument,
		range: vscode.Range | vscode.Selection
	): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
		const uri = document.uri.toString();
		if (!this._errors.fileSpecificErrors.has(uri)) {
			return [];
		}

		const errors = this._errors.fileSpecificErrors.get(uri)!;

		const actions: ErrorCodeAction[] = [];

		for (const error of errors) {
			if (error.lineNumber === null) {
				continue;
			}
			if (error.lineNumber !== range.start.line + 1) {
				continue;
			}
			if (!error.ignorable) {
				continue;
			}
			const action = new ErrorCodeAction(document, error);
			action.diagnostics = [this._createDiagnostic(range, error)];
			actions.push(action);
		}

		return actions;
	}

	public resolveCodeAction(
		codeAction: ErrorCodeAction
	): vscode.ProviderResult<vscode.CodeAction> {
		codeAction.resolveEdit();
		return codeAction;
	}

	public clearErrors(): void {
		this._errors = {
			fileSpecificErrors: new Map(),
			notFileSpecificErrors: [],
		};
		this._diagnosticsCollection.clear();
	}

	public dispose(): void {
		this._diagnosticsCollection.dispose();
	}
}

class ErrorCodeAction extends vscode.CodeAction {
	public constructor(
		private readonly _document: vscode.TextDocument,
		private readonly _error: PHPStanError
	) {
		super('Ignore PHPStan error', vscode.CodeActionKind.QuickFix);
	}

	public resolveEdit(): void {
		if (this._error.lineNumber === null) {
			// Theoretically not reachable
			return;
		}

		const lineNumber = this._error.lineNumber - 1;
		const ignoreCommentContent = this._error.identifier
			? `@phpstan-ignore ${this._error.identifier}`
			: '@phpstan-ignore-next-line';

		const previousLineRange = new vscode.Range(
			lineNumber - 1,
			0,
			lineNumber - 1,
			this._document.lineAt(lineNumber - 1).text.length
		);
		const previousLineText = this._document.getText(previousLineRange);

		const singlelineDocblockMatch = /^(\s*)\/\*\*+\s*(.*)\s*\*\/(\s*)/.exec(
			previousLineText
		);
		if (singlelineDocblockMatch) {
			const [, indent, content, trailingWhitespace] =
				singlelineDocblockMatch;
			const replacement =
				`${indent}/**\n` +
				`${indent} * ${content}\n` +
				`${indent} * ${ignoreCommentContent}\n` +
				`${indent} */${trailingWhitespace}`;
			this._replace(previousLineRange, replacement);
			return;
		}

		const multilineDocblockMatch = /^(\s*)(\*+)\/(\s*)/.exec(
			previousLineText
		);
		if (multilineDocblockMatch) {
			const [, indent, closingStars, trailingWhitespace] =
				multilineDocblockMatch;
			const replacement =
				`${indent}* ${ignoreCommentContent}\n` +
				`${indent}${closingStars}/${trailingWhitespace}`;
			this._replace(previousLineRange, replacement);
			return;
		}

		const errorRange = new vscode.Range(
			lineNumber,
			0,
			lineNumber,
			this._document.lineAt(lineNumber).text.length
		);
		const originalText = this._document.getText(errorRange);
		const indent = /^(\s*)/.exec(originalText)?.[1] ?? '';

		this._replace(
			errorRange,
			`${indent}// ${ignoreCommentContent}\n${originalText}`
		);
	}

	private _replace(range: vscode.Range, newText: string): void {
		this.edit = new vscode.WorkspaceEdit();
		this.edit.replace(this._document.uri, range, newText, {
			label: 'Ignore PHPStan error',
			needsConfirmation: false,
		});
	}
}
