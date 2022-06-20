import { Diagnostic, DiagnosticSeverity, Range } from 'vscode-languageserver';
import type { PartialDocument } from './runner';

export class OutputParser {
	public constructor(
		private readonly _output: string,
		private readonly _filePath: string,
		private readonly _file: PartialDocument
	) {}

	public parse(): Diagnostic[] {
		return (
			this._output
				.split('\n')
				.map((l) => l.trim())
				.filter((l) => l.length > 0)
				.map((line) => {
					// Parse
					const match = /^(.*):(\d+):(.*)$/.exec(line);
					if (!match) {
						return null;
					}

					const [, file, lineNumber, message] = match;
					return {
						file,
						lineNumber: parseInt(lineNumber, 10),
						message,
					};
				})
				// Filter
				.filter(
					(
						result
					): result is {
						file: string;
						lineNumber: number;
						message: string;
					} => result !== null
				)
				.filter(({ file }) => file.includes(this._filePath))
				.map((error) => {
					// Get text range
					const line = error.lineNumber - 1;
					const fullLineText = this._file.getText().split('\n')[line];

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

					const range = Range.create(line, startChar, line, endChar);

					return Diagnostic.create(
						range,
						error.message,
						DiagnosticSeverity.Error
					);
				})
		);
	}
}
