import { window, type ExtensionContext } from 'vscode';
import { ERROR_PREFIX, log } from './log';

const shownWarnings: Set<string> = new Set();

export function showErrorOnce(
	context: ExtensionContext,
	message: string,
	...extra: string[]
): void {
	log(context, ERROR_PREFIX, message, ...extra);
	if (shownWarnings.has(message)) {
		return;
	}
	showError(message);
	shownWarnings.add(message);
}

interface ErrorOption {
	title: string;
	callback: () => void;
}

export function showError(message: string, options?: ErrorOption[]): void {
	void window
		.showErrorMessage(message, ...(options || []).map((o) => o.title))
		.then((choice) => {
			if (!options || !choice) {
				return;
			}

			const match = options.find((o) => o.title === choice);
			match?.callback();
		});
}
