import { normalizePath } from '../../../../shared/util';
import { PHPStanCheckResult } from './runner';

interface PartialPHPStanError {
	message: string;
	lineNumber?: number;
	file?: string;
}

export class OutputParser {
	public constructor(private readonly _output: PHPStanCheckResult) {}

	public parse(): ReportedErrors {
		const notFileSpecificErrors: string[] = this._output.errors;
		const fileSpecificErrors: ReportedErrors['fileSpecificErrors'] = {};
		for (const filePath in this._output.files) {
			fileSpecificErrors[filePath] = this._output.files[
				filePath
			].messages.map((message) => ({
				message: message.message,
				lineNumber: message.line,
			}));
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
			lineNumber: number;
		}[]
	>;
	notFileSpecificErrors: string[];
}
