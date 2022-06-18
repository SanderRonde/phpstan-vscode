import { NotificationChannel } from '../../../shared/notificationChannels';
import type { CommandMessage } from '../../../client/src/lib/commands';
import type { _Connection } from 'vscode-languageserver';

export async function executeCommand(
	connection: _Connection,
	...args: string[]
): Promise<void> {
	await connection.sendNotification(NotificationChannel.COMMAND, {
		commandName: args[0],
		commandArgs: args.slice(1),
	} as CommandMessage);
}
