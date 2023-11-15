import { normalizePath } from '../../../../shared/util';

interface PartialPHPStanError {
	message: string;
	lineNumber?: number;
	file?: string;
}

export class OutputParser {
	public constructor(private readonly _output: string) {}

	private _toLines(): PartialPHPStanError[] {
		const lines = this._output
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0);
		const errors: PartialPHPStanError[] = [];
		for (const line of lines) {
			// Parse
			const match = /^(.*):(\d+|\?):(.*)$/.exec(line);
			if (!match) {
				continue;
			}

			const [, file, lineNumber, message] = match;
			if (file === '?' || lineNumber === '?') {
				errors.push({
					message,
				});
			}

			errors.push({
				file: normalizePath(file),
				lineNumber: parseInt(lineNumber, 10),
				message,
			});
		}

		return errors;
	}

	public parse(): ReportedErrors {
		const lines = this._toLines();
		const notFileSpecificErrors: string[] = [];
		const fileSpecificErrors: ReportedErrors['fileSpecificErrors'] = {};
		for (const error of lines) {
			if (error.lineNumber && error.file) {
				fileSpecificErrors[error.file] ??= [];
				fileSpecificErrors[error.file].push({
					lineNumber: error.lineNumber,
					message: error.message,
				});
			} else {
				notFileSpecificErrors.push(error.message);
			}
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
