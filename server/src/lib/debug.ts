import { debugNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';

export function debug(
	connection: _Connection,
	type: string,
	...data: unknown[]
): void {
	void connection.sendNotification(debugNotification, {
		debugData: {
			type,
			data,
		},
	});
}

export * from '../../../shared/debug';
