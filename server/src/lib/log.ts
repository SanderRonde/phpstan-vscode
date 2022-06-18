import { NotificationChannel } from '../../../shared/notificationChannels';
import type { _Connection } from 'vscode-languageserver';

export async function log(
	connection: _Connection,
	...data: string[]
): Promise<void> {
	await connection.sendNotification(NotificationChannel.LOG, data);
}
