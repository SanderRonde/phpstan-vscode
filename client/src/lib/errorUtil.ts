import { window } from 'vscode';

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
