import { decode, Map as NeonMap } from 'neon-js';
import type { Neon } from 'neon-js';
import fs from 'fs/promises';
import path from 'path';

async function readNeonFile(
	filePath: string,
	onError: (error: Error) => void
): Promise<Neon[]> {
	// Skip non-.neon files
	if (!filePath.endsWith('.neon')) {
		return [];
	}
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

			// Skip non-.neon files
			const resolvedPath = path.isAbsolute(file)
				? file
				: path.join(path.dirname(filePath), file);
			if (!resolvedPath.endsWith('.neon')) {
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

		const configFileDir = path.dirname(this.filePath);
		for (const excludePath of this.excludePaths) {
			if (
				matchesNeonPath(path.join(configFileDir, excludePath), filePath)
			) {
				return false;
			}
		}

		for (const includePath of this.paths) {
			if (
				matchesNeonPath(path.join(configFileDir, includePath), filePath)
			) {
				return true;
			}
		}

		return false;
	}
}

/**
 * Match a PHPStan `paths` / `excludePaths` entry against a file.
 * Directory entries without wildcards include all descendants. Globs are
 * anchored and `*` does not cross path separators (`**` does).
 */
export function matchesNeonPath(pattern: string, filePath: string): boolean {
	const normalizedPattern = path.normalize(pattern).replace(/\\/g, '/');
	const normalizedFile = path.normalize(filePath).replace(/\\/g, '/');

	if (!/[*?]/.test(normalizedPattern)) {
		if (normalizedFile === normalizedPattern) {
			return true;
		}
		const prefix = normalizedPattern.endsWith('/')
			? normalizedPattern
			: `${normalizedPattern}/`;
		return normalizedFile.startsWith(prefix);
	}

	return neonGlobMatch(normalizedPattern, normalizedFile);
}

function neonGlobMatch(pattern: string, filePath: string): boolean {
	let regex = '^';
	for (let i = 0; i < pattern.length; i++) {
		const char = pattern[i];
		if (char === '*') {
			if (pattern[i + 1] === '*') {
				if (pattern[i + 2] === '/') {
					regex += '(?:.*/)?';
					i += 2;
				} else {
					regex += '.*';
					i += 1;
				}
			} else {
				regex += '[^/]*';
			}
		} else if (char === '?') {
			regex += '[^/]';
		} else {
			regex += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
		}
	}
	regex += '$';
	try {
		return new RegExp(regex).test(filePath);
	} catch {
		return false;
	}
}
