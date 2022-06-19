import { commandNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';

export async function executeCommand(
	connection: _Connection,
	...args: string[]
): Promise<void> {
	await connection.sendNotification(commandNotification, {
		commandName: args[0],
		commandArgs: args.slice(1),
	});
}
