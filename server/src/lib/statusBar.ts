import type { OperationResult } from '../../../shared/statusBar';
import { statusBarNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';

export class StatusBar {
	private _lastOperationId: number = 0;

	public constructor(private readonly _connection: _Connection) {}

	public async pushOperation(
		operation: Promise<OperationResult>
	): Promise<void> {
		const id = this._lastOperationId++;
		await this._connection.sendNotification(statusBarNotification, {
			opId: id,
		});
		void operation.then(async (result) => {
			await this._connection.sendNotification(statusBarNotification, {
				opId: id,
				result,
			});
		});
	}
}
