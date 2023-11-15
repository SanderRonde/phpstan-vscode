import type { Disposable } from 'vscode';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import { constants } from 'fs';

export function deepObjectJoin<A, B>(objA: A, objB: B): A & B {
	const result: Partial<A & B> = {};
	for (const key in objA) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		result[key] = objA[key] as any;
	}
	for (const key in objB) {
		if (key in result) {
			// Already set
			if (typeof objB[key] === 'object' && objB[key]) {
				result[key] = deepObjectJoin(
					objA[key as unknown as keyof A],
					objB[key]
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				) as any;
			} else {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				result[key] = objB[key] as any;
			}
		} else {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			result[key] = objB[key] as any;
		}
	}
	return result as A & B;
}

/**
 * Assert that forces TS to check whether a route is reachable
 */
export function assertUnreachable(x: never): void {
	if (x) {
		throw new Error(
			`Value of type '${typeof x}' was not expected and should be unreachable`
		);
	}
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

export function withTimeout<P, R>(config: {
	onTimeout: () => R;
	promise: Promise<P>;
	timeout: number;
}): Disposable & {
	promise: Promise<P | R>;
} {
	let timeout: NodeJS.Timeout | null = null;
	const promise = new Promise<P | R>((resolve) => {
		timeout = setTimeout(() => {
			resolve(config.onTimeout());
		}, config.timeout);
		void config.promise.then((result) => {
			resolve(result);
			if (timeout) {
				clearTimeout(timeout);
			}
		});
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

export function normalizePath(filePath: string): string {
	if (process.platform !== 'win32') {
		return filePath;
	}
	return filePath.replace(/\\/g, '/');
}

export async function pathExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath, constants.F_OK);
		return true;
	} catch (e) {
		return false;
	}
}

export async function tryReadFile(filePath: string): Promise<string | null> {
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
