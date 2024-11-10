import { decode, Map as NeonMap } from 'neon-js';
import type { Neon } from 'neon-js';
import fs from 'fs/promises';
import path from 'path';

export async function readNeonFile(filePath: string): Promise<Neon[]> {
	const parsed = decode(await fs.readFile(filePath, 'utf8'));

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
				output.push(...(await readNeonFile(file)));
			} else {
				output.push(
					...(await readNeonFile(
						path.join(path.dirname(filePath), file)
					))
				);
			}
		}
	}

	return output;
}

export async function getAnalyzePaths(filePath: string): Promise<{
	paths: string[];
	excludePaths: string[];
}> {
	const neonFiles = await readNeonFile(filePath);

	const parsePaths = (pathsMap: Neon): string[] => {
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
			paths.push(...parsePaths(pathsMap.get('analyse')));
		}
		if (pathsMap.has('analyseAndScan')) {
			paths.push(...parsePaths(pathsMap.get('analyseAndScan')));
		}

		return paths;
	};

	const paths: string[] = [];
	const excludePaths: string[] = [];
	for (const neonFile of neonFiles) {
		if (!(neonFile instanceof NeonMap)) {
			continue;
		}

		const parameters = neonFile.get('parameters');
		if (!(parameters instanceof NeonMap)) {
			continue;
		}

		if (parameters.has('paths')) {
			paths.push(...parsePaths(parameters.get('paths')));
		}
		if (parameters.has('excludePaths')) {
			excludePaths.push(...parsePaths(parameters.get('excludePaths')));
		}
	}

	return {
		paths,
		excludePaths,
	};
}

export async function isInPaths(
	filePath: string,
	configFilePath: string
): Promise<boolean> {
	const { paths, excludePaths } = await getAnalyzePaths(configFilePath);

	function fnmatch(pattern: string, string: string): boolean {
		// Escape special regex characters
		let regexPattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');

		// Convert shell wildcard characters to regex equivalents
		regexPattern = regexPattern.replace(/\*/g, '.*').replace(/\?/g, '.');

		// Add start and end anchors
		regexPattern = '^' + regexPattern;

		// Create and test the regular expression
		const regex = new RegExp(regexPattern);
		return regex.test(string);
	}

	const configFileDir = path.dirname(configFilePath);
	for (const excludePath of excludePaths) {
		if (fnmatch(path.join(configFileDir, excludePath), filePath)) {
			return false;
		}
	}

	for (const includePath of paths) {
		if (fnmatch(path.join(configFileDir, includePath), filePath)) {
			return true;
		}
	}

	return false;
}
