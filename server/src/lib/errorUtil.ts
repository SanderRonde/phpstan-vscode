import { configErrorNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import { ERROR_PREFIX, log } from './log';

const shownWarnings: Set<string> = new Set();

export function showErrorOnce(
	connection: _Connection,
	message: string,
	...extra: string[]
): void {
	log(ERROR_PREFIX, message, ...extra);
	if (shownWarnings.has(message)) {
		return;
	}

	// Determine error type from message
	let errorType: 'config' | 'binary' | 'cwd' | 'other' = 'other';
	if (message.includes('config file')) {
		errorType = 'config';
	} else if (message.includes('binary') || message.includes('Binary')) {
		errorType = 'binary';
	} else if (message.includes('CWD') || message.includes('rootDir')) {
		errorType = 'cwd';
	}

	// Send notification to client to update status bar
	void connection.sendNotification(configErrorNotification, {
		error: message,
		errorType,
	});

	shownWarnings.add(message);
}

interface ErrorOption {
	title: string;
	callback: () => void;
}

export function showError(
	connection: _Connection,
	message: string,
	options: ErrorOption[] = []
): void {
	void connection.window
		.showErrorMessage(message, ...options.map(({ title }) => ({ title })))
		.then((choice) => {
			if (!options || !choice) {
				return;
			}

			const match = options.find((o) => o.title === choice.title);
			void match?.callback();
		});
}

export function clearConfigError(connection: _Connection): void {
	void connection.sendNotification(configErrorNotification, {
		error: null,
		errorType: 'other',
	});
}
