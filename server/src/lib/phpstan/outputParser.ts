import type { PHPStanCheckResult } from './runner';

const IN_CONTEXT_OF_PREFIX = ' (in context of';
export class OutputParser {
	public constructor(private readonly _output: PHPStanCheckResult) {}

	public parse(): ReportedErrors {
		const notFileSpecificErrors: string[] = this._output.errors;
		const fileSpecificErrors: ReportedErrors['fileSpecificErrors'] = {};
		for (const key in this._output.files) {
			let filePath = key;
			let messagePostfix = '';

			// PHPStan reports error in the context of traits as errors in separate
			// files postfixed with some string. We remove this postfix and join
			// the errors with the original file, moving the postfix to the message instead.
			const contextIndex = key.indexOf(IN_CONTEXT_OF_PREFIX);
			if (contextIndex !== -1) {
				filePath = key.split(IN_CONTEXT_OF_PREFIX)[0];
				messagePostfix = key.slice(contextIndex);
			}
			fileSpecificErrors[filePath] = [
				...(fileSpecificErrors[filePath] ?? []),
				...this._output.files[key].messages.map((message) => ({
					message: message.message + messagePostfix,
					lineNumber: message.line,
				})),
			];
		}

		return {
			fileSpecificErrors,
			notFileSpecificErrors,
		};
	}
}

export interface ReportedErrors {
	fileSpecificErrors: Record<
		string,
		{
			message: string;
			lineNumber: number | null;
		}[]
	>;
	notFileSpecificErrors: string[];
}
