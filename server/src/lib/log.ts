import { logNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';

export async function log(
	connection: _Connection,
	...data: string[]
): Promise<void> {
	console.log(data.join(' '));
	await connection.sendNotification(logNotification, {
		data: data,
	});
}
