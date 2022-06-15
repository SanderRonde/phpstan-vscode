/**
 * Offering the feature of checking unsaved files brings
 * a little bit of an issue with it. Unsaved files are written
 * to a temporary path, but PHPStan compares the errors in the
 * ignoreErrors set to the curent path of the file. This means that
 * it doesn't properly do this matching. We manually filter out
 * those errors that should have been ignored by the ignoreErrors config.
 */

import { InvalidNeonValue, parseNeonFile } from './neon';
import * as fsPromises from 'fs/promises';
import { CheckConfig } from './phpstan';
import { deepObjectJoin } from './util';
import * as vscode from 'vscode';
import * as path from 'path';
import { log } from './log';
import * as fs from 'fs';

class CachedFileReader implements vscode.Disposable {
	private _cachedValue: string | null = null;
	private _watching: boolean = false;
	private _watcher: fs.StatWatcher | null = null;

	public constructor(private readonly _filePath: string) {}

	private _initWatcher(): void {
		if (this._watching) {
			return;
		}

		this._watcher = fs.watchFile(
			this._filePath,
			{
				persistent: false,
			},
			() => {
				this._cachedValue = null;
			}
		);
		this._watcher.unref();
	}

	public async read(): Promise<string> {
		if (this._cachedValue) {
			return this._cachedValue;
		}

		this._initWatcher();
		const content = await fsPromises.readFile(this._filePath, 'utf8');
		this._cachedValue = content;
		return content;
	}

	public dispose(): void {
		if (this._watcher) {
			this._watcher.removeAllListeners();
			this._watcher = null;
		}
	}
}

const readers: Map<string, CachedFileReader> = new Map();
function readConfigFile(
	filePath: string,
	context: vscode.ExtensionContext
): Promise<string> {
	if (!readers.has(filePath)) {
		const reader = new CachedFileReader(filePath);
		context.subscriptions.push(reader);
		readers.set(filePath, reader);
	}

	return readers.get(filePath)!.read();
}

type PHPStanIgnoreError =
	| {
			message: string | RegExp;
			count?: number;
			path?: string;
			paths?: string[];
	  }
	| string
	| RegExp
	| undefined;

interface PHPStanConfig {
	includes?: string[];
	parameters?: {
		ignoreErrors?: PHPStanIgnoreError[];
	};
}

async function getPHPStanConfig(
	checkConfig: CheckConfig,
	context: vscode.ExtensionContext
): Promise<PHPStanConfig> {
	let entrypointFile = parseNeonFile(
		await readConfigFile(checkConfig.configFile!, context)
	) as PHPStanConfig;
	if (entrypointFile.includes) {
		for (const include of entrypointFile.includes) {
			const filePath = path.join(
				path.dirname(checkConfig.configFile!),
				include
			);
			entrypointFile = deepObjectJoin(
				entrypointFile,
				parseNeonFile(await readConfigFile(filePath, context))
			);
		}
	}
	return entrypointFile;
}

async function getErrorsToIgnore(
	checkConfig: CheckConfig,
	context: vscode.ExtensionContext
): Promise<(PHPStanIgnoreError | InvalidNeonValue)[]> {
	if (!checkConfig.configFile) {
		return [];
	}
	const file = await getPHPStanConfig(checkConfig, context);
	return file.parameters?.ignoreErrors ?? [];
}

function matchesStringOrRegexp(
	target: string,
	matcher: string | RegExp
): boolean {
	if (typeof matcher === 'string') {
		return target.includes(matcher);
	}
	return matcher.test(target);
}

function isIgnored(
	error: vscode.Diagnostic,
	ignoredErrors: PHPStanIgnoreError[]
): boolean {
	for (const ignoredError of ignoredErrors) {
		if (
			typeof ignoredError === 'string' ||
			ignoredError instanceof RegExp
		) {
			if (matchesStringOrRegexp(error.message, ignoredError)) {
				return true;
			}
		} else if (typeof ignoredError === 'object') {
			if (typeof ignoredError.count === 'number' && !ignoredError.count) {
				continue;
			}

			if (matchesStringOrRegexp(error.message, ignoredError.message)) {
				if (ignoredError.count) {
					ignoredError.count--;
				}
				return true;
			}
		}
	}
	return false;
}

export async function filterBaselineErrorsForFile(
	checkConfig: CheckConfig,
	originalFilePath: string,
	errors: vscode.Diagnostic[],
	context: vscode.ExtensionContext
): Promise<vscode.Diagnostic[]> {
	const ignoreErrors = await getErrorsToIgnore(checkConfig, context);
	// Find rules that match current file
	const matchingErrors = ignoreErrors
		.filter((error) => {
			if (!error) {
				return false;
			}
			if (typeof error === 'string' || error instanceof RegExp) {
				return true;
			}
			if (typeof error === 'object' && 'invalid' in error) {
				log(
					'Failed to parse "ignoreErrors" value in config. Source string:',
					error.source
				);
				return false;
			}
			if (!error.path && !error.path) {
				return true;
			}
			const paths = error.paths ? error.paths : [error.path];
			return paths.some((errorPath) =>
				originalFilePath.includes(errorPath)
			);
		})
		.map((err) => (typeof err === 'object' ? { ...err } : err));

	const finalErrors: vscode.Diagnostic[] = [];
	// Filter out error that match the message
	for (const error of errors) {
		if (!isIgnored(error, matchingErrors as PHPStanIgnoreError[])) {
			finalErrors.push(error);
		}
	}

	return finalErrors;
}
