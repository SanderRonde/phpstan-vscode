import type { PHPStanError } from '../../../../shared/notificationChannels';

export class OutputParser {
	public constructor(private readonly _output: string) {}

	private _toLines(): {
		file: string;
		lineNumber: number;
		message: string;
	}[] {
		return this._output
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
			.filter(
				(
					result
				): result is {
					file: string;
					lineNumber: number;
					message: string;
				} => result !== null
			);
	}

	public parse(): Record<string, PHPStanError[]> {
		const lines = this._toLines();
		const errors: Record<string, PHPStanError[]> = {};
		for (const error of lines) {
			errors[error.file] ??= [];
			errors[error.file].push(error);
		}

		return errors;
	}
}
