import { commandNotification } from './notificationChannels';
import { Commands } from '../../../shared/commands/defs';
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
	showError(connection, message, [
		{
			title: 'Launch setup',
			callback: () => {
				void connection.sendNotification(commandNotification, {
					commandName: Commands.LAUNCH_SETUP,
					commandArgs: [],
				});
			},
		},
	]);
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
