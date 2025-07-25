import { decode, Map as NeonMap } from 'neon-js';
import type { Neon } from 'neon-js';
import fs from 'fs/promises';
import path from 'path';

async function readNeonFile(
	filePath: string,
	onError: (error: Error) => void
): Promise<Neon[]> {
	const parsed = await (async () => {
		try {
			return decode(await fs.readFile(filePath, 'utf8'));
		} catch (error) {
			onError(error as Error);
			return null;
		}
	})();
	if (!parsed) {
		return [];
	}

	const output: Neon[] = [parsed];
	if (!(parsed instanceof NeonMap)) {
		return output;
	}

	if (parsed.has('includes')) {
		const includes = parsed.get('includes');
		if (!(includes instanceof NeonMap) || !includes.isList()) {
			return output;
		}

		for (const file of includes.values()) {
			if (typeof file !== 'string') {
				continue;
			}

			if (path.isAbsolute(file)) {
				output.push(...(await readNeonFile(file, onError)));
			} else {
				output.push(
					...(await readNeonFile(
						path.join(path.dirname(filePath), file),
						onError
					))
				);
			}
		}
	}

	return output;
}

export class ParsedConfigFile {
	public contents!: Neon[];
	public paths: string[] = [];
	public excludePaths: string[] = [];

	private constructor(public filePath: string) {}

	public static async from(
		filePath: string,
		onError: (error: Error) => void
	): Promise<ParsedConfigFile> {
		const parsedFile = new ParsedConfigFile(filePath);
		parsedFile.contents = await readNeonFile(filePath, onError);

		const { paths, excludePaths } = this._getIncludedPaths(
			parsedFile.contents
		);
		parsedFile.paths = paths;
		parsedFile.excludePaths = excludePaths;
		return parsedFile;
	}

	private static _getIncludedPaths(neonFiles: Neon[]): {
		paths: string[];
		excludePaths: string[];
	} {
		const paths: string[] = [];
		const excludePaths: string[] = [];
		for (const neonFile of neonFiles) {
			if (!(neonFile instanceof NeonMap)) {
				continue;
			}

			if (!neonFile.has('parameters')) {
				continue;
			}

			const parameters = neonFile.get('parameters');
			if (!(parameters instanceof NeonMap)) {
				continue;
			}

			if (parameters.has('paths')) {
				paths.push(...this._parsePaths(parameters.get('paths')));
			}
			if (parameters.has('excludePaths')) {
				excludePaths.push(
					...this._parsePaths(parameters.get('excludePaths'))
				);
			}
		}

		return {
			paths,
			excludePaths,
		};
	}

	private static _parsePaths(pathsMap: Neon): string[] {
		if (!(pathsMap instanceof NeonMap)) {
			return [];
		}

		const paths: string[] = [];
		if (pathsMap.isList()) {
			for (const path of pathsMap.values()) {
				if (typeof path !== 'string') {
					continue;
				}

				paths.push(path);
			}
			return paths;
		}

		if (pathsMap.has('analyse')) {
			paths.push(...this._parsePaths(pathsMap.get('analyse')));
		}
		if (pathsMap.has('analyseAndScan')) {
			paths.push(...this._parsePaths(pathsMap.get('analyseAndScan')));
		}

		return paths;
	}

	public isInPaths(filePath: string): boolean {
		if (filePath === this.filePath) {
			return true;
		}

		function fnmatch(pattern: string, string: string): boolean {
			// Escape special regex characters
			let regexPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

			// Convert shell wildcard characters to regex equivalents
			regexPattern = regexPattern
				.replace(/\*/g, '.*')
				.replace(/\?/g, '.');

			// Add start and end anchors
			regexPattern = '^' + regexPattern;

			// Create and test the regular expression
			const regex = new RegExp(regexPattern);
			return regex.test(string);
		}

		const configFileDir = path.dirname(this.filePath);
		const safeFnmatch = (pattern: string, string: string): boolean => {
			try {
				return fnmatch(pattern, string);
			} catch (e) {
				// The file/folder does not exist
				return false;
			}
		};

		for (const excludePath of this.excludePaths) {
			if (safeFnmatch(path.join(configFileDir, excludePath), filePath)) {
				return false;
			}
		}

		for (const includePath of this.paths) {
			if (safeFnmatch(path.join(configFileDir, includePath), filePath)) {
				return true;
			}
		}

		return false;
	}
}
