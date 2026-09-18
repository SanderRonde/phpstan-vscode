import type {
	SpawnOptionsWithStdioTuple,
	StdioNull,
	StdioPipe,
} from 'child_process';
import type { Disposable } from 'vscode';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { constants } from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Assert that forces TS to check whether a route is reachable
 */
export function assertUnreachable(x: never): never {
	throw new Error(
		`Value of type '${typeof x}' was not expected and should be unreachable`
	);
}

export async function wait(time: number): Promise<void> {
	await new Promise<void>((resolve) => setTimeout(resolve, time));
}

export async function waitPeriodical<R>(
	totalTime: number,
	periodTime: number,
	callback: () => R | null
): Promise<R | null> {
	let passedTime = 0;
	while (passedTime < totalTime) {
		const result = callback();
		if (result !== null) {
			return result;
		}
		const waitedTime = Math.min(periodTime, totalTime - passedTime);
		await wait(waitedTime);
		passedTime += waitedTime;
	}
	return null;
}

export interface PromiseObject<R> {
	promise: Promise<R>;
	resolve: (result: R) => void;
}

export function createPromise<R>(): Promise<PromiseObject<R>> {
	return new Promise<{
		promise: Promise<R>;
		resolve: (result: R) => void;
	}>((resolve) => {
		const promise = new Promise<R>((_resolve) => {
			resolve({
				resolve: _resolve,
				get promise() {
					return promise;
				},
			});
		});
	});
}

export function withTimeout<P, R>(timeoutConfig: {
	onTimeout: () => R;
	onError: (error: Error) => R;
	promise: Promise<P>;
	timeout: number;
}): Disposable & {
	promise: Promise<P | R>;
} {
	let timeout: NodeJS.Timeout | null = null;
	const promise = new Promise<P | R>((resolve) => {
		timeout = setTimeout(() => {
			resolve(timeoutConfig.onTimeout());
		}, timeoutConfig.timeout);
		void timeoutConfig.promise.then(
			(result) => {
				resolve(result);
				if (timeout) {
					clearTimeout(timeout);
				}
			},
			(error) => {
				resolve(timeoutConfig.onError(error as Error));
				if (timeout) {
					clearTimeout(timeout);
				}
			}
		);
	});
	return {
		dispose: () => (timeout ? clearTimeout(timeout) : void 0),
		promise,
	};
}

export function toCheckablePromise<R>(promise: Promise<R>): {
	promise: Promise<R>;
	done: boolean;
} {
	let done = false;
	void promise.then(() => {
		done = true;
	});
	return {
		promise,
		get done() {
			return done;
		},
	};
}

export async function pathExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath, constants.R_OK);
		return true;
	} catch (e) {
		return false;
	}
}

async function tryReadFile(filePath: string): Promise<string | null> {
	try {
		const contents = await fs.readFile(filePath, 'utf-8');
		return contents;
	} catch (error) {
		return null;
	}
}

export async function tryReadJSON<J>(filePath: string): Promise<J | null> {
	const text = await tryReadFile(filePath);
	if (text === null) {
		return null;
	}
	return JSON.parse(text) as J;
}

export function basicHash(content: string): string {
	return crypto.createHash('md5').update(content).digest('hex');
}

export function fromEntries<T>(
	entries: Iterable<readonly [string, T]>
): Record<string, T> {
	const result: Record<string, T> = {};
	for (const [key, value] of entries) {
		result[key] = value;
	}
	return result;
}

export async function getConfigFile(
	configFile: string,
	cwd: string | undefined,
	pathExistsFn: (filePath: string) => Promise<boolean> = pathExists
): Promise<string | null> {
	const absoluteConfigPaths = configFile
		? configFile.split(',').map((c) => getAbsolutePath(c.trim(), cwd))
		: [];
	for (const absoluteConfigPath of absoluteConfigPaths) {
		if (absoluteConfigPath && (await pathExistsFn(absoluteConfigPath))) {
			return absoluteConfigPath;
		}
	}

	return null;
}

function getAbsolutePath(filePath: string | null, cwd?: string): string | null {
	if (!filePath) {
		return null;
	}

	if (path.isAbsolute(filePath)) {
		return filePath;
	}
	if (!cwd) {
		return null;
	}
	return path.join(cwd, filePath);
}

export async function docker(
	args: ReadonlyArray<string>,
	dockerEnv: Record<string, string> | null,
	options: Omit<
		SpawnOptionsWithStdioTuple<StdioNull, StdioPipe, StdioPipe>,
		'stdio'
	> = {}
): Promise<{
	success: boolean;
	code: number;
	stdout: string;
	stderr: string;
	err: Error | null;
}> {
	const proc = spawn('docker', args, {
		...options,
		env: {
			...process.env,
			...dockerEnv,
		},
		stdio: ['ignore', 'pipe', 'pipe'],
	});
	let stdout = '';
	proc.stdout.on('data', (data: string | Buffer) => {
		stdout += data.toString();
	});
	let stderr = '';
	proc.stderr.on('data', (data: string | Buffer) => {
		stderr += data.toString();
	});

	return new Promise((resolve) => {
		proc.once('error', (err) => {
			resolve({
				success: false,
				code: 1,
				stdout: stdout,
				stderr: stderr,
				err,
			});
		});
		proc.once('exit', (code: number) => {
			resolve({
				success: code === 0,
				code,
				stdout: stdout,
				stderr: stderr,
				err: null,
			});
		});
	});
}

/**
 * POSIX-style quoting for `sh -c` argument lists (docker exec).
 */
export function shellQuote(value: string): string {
	return `'${value.replace(/'/g, `'\\''`)}'`;
}

/**
 * True when `filePath` is `rootPath` or a descendant. Uses a separator
 * boundary so `/workspace` does not match `/workspace-other`.
 */
export function isPathEqualOrInside(
	filePath: string,
	rootPath: string
): boolean {
	const file = path.normalize(filePath);
	const root = path.normalize(rootPath);
	const compareFile =
		process.platform === 'win32' ? file.toLowerCase() : file;
	const compareRoot =
		process.platform === 'win32' ? root.toLowerCase() : root;
	if (compareFile === compareRoot) {
		return true;
	}
	const prefix = compareRoot.endsWith(path.sep)
		? compareRoot
		: compareRoot + path.sep;
	return compareFile.startsWith(prefix);
}

/**
 * Order neon configs relative to a file: same directory, then parent
 * directories (closest first), then children/siblings (closest first).
 */
export function compareConfigDirOrder(
	fileDir: string,
	aDir: string,
	bDir: string
): number {
	const rank = (dir: string): { group: number; depth: number } => {
		const relative = path.relative(fileDir, dir);
		if (relative === '' || relative === '.') {
			return { group: 0, depth: 0 };
		}
		const parts = relative.split(path.sep).filter((part) => part.length);
		const isAncestor =
			parts.length > 0 && parts.every((part) => part === '..');
		if (isAncestor) {
			return { group: 1, depth: parts.length };
		}
		return { group: 2, depth: parts.length };
	};

	const aRank = rank(aDir);
	const bRank = rank(bDir);
	if (aRank.group !== bRank.group) {
		return aRank.group - bRank.group;
	}
	return aRank.depth - bRank.depth;
}

export function getPathMapper(
	pathMapping: Record<string, string>,
	workspaceRoot?: string
): (filePath: string, inverse?: boolean) => string {
	return (filePath: string, inverse: boolean = false) => {
		if (Object.keys(pathMapping).length === 0) {
			return filePath;
		}
		const expandedFilePath = filePath.replace(/^~/, os.homedir());
		const mappings = Object.entries(pathMapping)
			.map(([fromPath, toPath]) => {
				let resolvedFrom = fromPath;
				if (!path.isAbsolute(resolvedFrom) && workspaceRoot) {
					resolvedFrom = path.join(workspaceRoot, resolvedFrom);
				}
				const [from, to] = inverse
					? [toPath, resolvedFrom]
					: [resolvedFrom, toPath];
				return {
					from: from.replace(/^~/, os.homedir()),
					to: to.replace(/^~/, os.homedir()),
				};
			})
			.sort((a, b) => b.from.length - a.from.length);

		for (const mapping of mappings) {
			if (isPathEqualOrInside(expandedFilePath, mapping.from)) {
				return `${mapping.to}${expandedFilePath.slice(mapping.from.length)}`.replace(
					/\\/g,
					'/'
				);
			}
		}
		return filePath;
	};
}
