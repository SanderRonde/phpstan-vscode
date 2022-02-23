import * as vscode from 'vscode';

const shownWarnings: Set<string> = new Set();

export function showErrorOnce(message: string): void {
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
	void vscode.window
		.showErrorMessage(message, ...(options || []).map((o) => o.title))
		.then((choice) => {
			if (!options || !choice) {
				return;
			}

			const match = options.find((o) => o.title === choice);
			match?.callback();
		});
}
