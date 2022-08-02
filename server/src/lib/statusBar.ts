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
			start: async (tooltip: string) => {
				await this._connection.sendNotification(statusBarNotification, {
					opId: id,
					type: 'new',
					tooltip,
				});
			},
			progress: async (progress: StatusBarProgress, tooltip: string) => {
				await this._connection.sendNotification(statusBarNotification, {
					progress: progress,
					opId: id,
					type: 'progress',
					tooltip,
				});
			},
			finish: async (result: OperationStatus) => {
				await this._connection.sendNotification(statusBarNotification, {
					opId: id,
					result,
					type: 'done',
				});
			},
		};
	}
}

export interface StatusBarOperation {
	start: (tooltip: string) => Promise<void>;
	progress: (progress: StatusBarProgress, tooltip: string) => Promise<void>;
	finish: (result: OperationStatus) => Promise<void>;
}
