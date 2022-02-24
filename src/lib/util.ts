import { Disposable } from 'vscode';

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

export function createDebouncer(delay: number): {
	debounce: (callback: () => void | Promise<void>) => void;
} & Disposable {
	let timeout: NodeJS.Timeout | null = null;
	return {
		debounce: (callback: () => void | Promise<void>): void => {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = setTimeout(() => {
				void callback();
				timeout = null;
			}, delay);
		},
		dispose() {
			if (timeout) {
				clearTimeout(timeout);
			}
			timeout = null;
		},
	};
}

export function assertUnreachable(x: never): void {
	if (x) {
		throw new Error(
			`Value of type '${typeof x}' was not expected and should be unreachable`
		);
	}
}
