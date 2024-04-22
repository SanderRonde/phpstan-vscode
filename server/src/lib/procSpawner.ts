import type {
	ChildProcess,
	SpawnSyncOptionsWithStringEncoding,
} from 'child_process';
import { processNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import { exec, spawn } from 'child_process';

export class ProcessSpawner {
	public constructor(private readonly _connection: _Connection) {}

	private async _getCodePage(): Promise<number | null> {
		return new Promise<number | null>((resolve) => {
			// Get code page, which is sort of equivalent to charset/encoding
			const chcpProc = spawn('chcp');
			let stdout = '';
			chcpProc.stdout.on('data', (chunk: Buffer | string) => {
				stdout += chunk.toString();
			});
			chcpProc.on('exit', (code) => {
				if (code === 0) {
					const match = /:\s*(\d+)/.exec(stdout);
					if (match) {
						resolve(Number(match[1]));
						return;
					}
				}
				resolve(null);
			});
			chcpProc.on('error', () => {
				resolve(null);
			});
		});
	}

	/**
	 * Spawns a process in a way that guarantees that it will be killed
	 * after given timeout. If VSCode is killed in the meantime, we still
	 * ensure it is killed on the next run.
	 */
	public async spawnWithRobustTimeout(
		binStr: string,
		args: string[],
		timeout: number,
		options: SpawnSyncOptionsWithStringEncoding
	): Promise<ChildProcess> {
		const proc = await (async () => {
			if (process.platform === 'win32') {
				const codePage = await this._getCodePage();
				if (codePage && codePage !== 850) {
					// Set codepage to 850 aka Latin 1
					return exec(
						`@chcp 850 >nul & cmd /d/s/c ${binStr} ${args.join(
							' '
						)}`,
						{
							cwd: options.cwd,
							encoding: 'utf-8',
						}
					);
				}
			}
			return spawn(binStr, args, options);
		})();

		if (proc.pid) {
			await this._connection.sendNotification(processNotification, {
				pid: proc.pid,
				timeout: timeout,
			});
		}
		return proc;
	}
}
