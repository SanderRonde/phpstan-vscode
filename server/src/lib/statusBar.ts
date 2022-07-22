import type { StatusBarProgress } from '../../../shared/notificationChannels';
import type { OperationStatus } from '../../../shared/statusBar';
import { statusBarNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';

export class StatusBar {
	private _lastOperationId: number = 0;

	public constructor(private readonly _connection: _Connection) {}

	public createOperation(): StatusBarOperation {
		const id = this._lastOperationId++;
		return {
			start: async () => {
				await this._connection.sendNotification(statusBarNotification, {
					opId: id,
				});
			},
			progress: async (progress: StatusBarProgress) => {
				await this._connection.sendNotification(statusBarNotification, {
					progress: progress,
					opId: id,
				});
			},
			finish: async (result: OperationStatus) => {
				await this._connection.sendNotification(statusBarNotification, {
					opId: id,
					result,
				});
			},
		};
	}
}

export interface StatusBarOperation {
	start: () => Promise<void>;
	progress: (progress: StatusBarProgress) => Promise<void>;
	finish: (result: OperationStatus) => Promise<void>;
}
