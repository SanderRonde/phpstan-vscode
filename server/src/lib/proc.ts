import type {
	ChildProcessWithoutNullStreams,
	SpawnOptionsWithoutStdio,
} from 'child_process';
import { processNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import { spawn } from 'child_process';

export class ProcessSpawner {
	public constructor(private readonly _connection: _Connection) {}

	/**
	 * Spawns a process in a way that guarantees that it will be killed
	 * after given timeout. If VSCode is killed in the meantime, we still
	 * ensure it is killed on the next run.
	 */
	public async spawnWithRobustTimeout(
		binStr: string,
		args: string[],
		timeout: number,
		options?: SpawnOptionsWithoutStdio
	): Promise<ChildProcessWithoutNullStreams> {
		const proc = spawn(binStr, args, options);
		if (proc.pid) {
			await this._connection.sendNotification(processNotification, {
				pid: proc.pid,
				timeout: timeout,
			});
		}
		return proc;
	}
}
