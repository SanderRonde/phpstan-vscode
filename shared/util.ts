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

export function getPathMapper(
	pathMapping: Record<string, string>,
	workspaceRoot?: string
): (filePath: string, inverse?: boolean) => string {
	return (filePath: string, inverse: boolean = false) => {
		if (Object.keys(pathMapping).length === 0) {
			return filePath;
		}
		const expandedFilePath = filePath.replace(/^~/, os.homedir());
		// eslint-disable-next-line prefer-const
		for (let [fromPath, toPath] of Object.entries(pathMapping)) {
			if (fromPath === '' || toPath === '') {
				continue;
			}

			if (!path.isAbsolute(fromPath) && workspaceRoot) {
				fromPath = path.join(workspaceRoot, fromPath);
			}

			const [from, to] = inverse
				? [toPath, fromPath]
				: [fromPath, toPath];
			const expandedFromPath = from.replace(/^~/, os.homedir());
			if (expandedFilePath.startsWith(expandedFromPath)) {
				return expandedFilePath.replace(
					expandedFromPath,
					to.replace(/^~/, os.homedir())
				);
			}
		}
		return filePath;
	};
}
