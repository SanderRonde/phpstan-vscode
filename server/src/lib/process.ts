import type {
	ChildProcess,
	SpawnSyncOptionsWithStringEncoding,
} from 'child_process';
import { processNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import type { AsyncDisposable } from './types';
import { exec, spawn } from 'child_process';
import { default as psTree } from 'ps-tree';
import type { Disposable } from 'vscode';
import type { Readable } from 'stream';

export class Process implements AsyncDisposable {
	private readonly _children: Set<number> = new Set();
	private readonly _disposables: Disposable[] = [];

	public constructor(
		private readonly _connection: _Connection,
		private readonly _process: ChildProcess,
		private readonly _timeout: number
	) {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		const interval = setInterval(async () => {
			if (!_process.pid) {
				return;
			}
			const children = await Process._getChildPids(_process.pid);
			children.forEach((pid) => {
				this._children.add(pid);
			});

			void _connection.sendNotification(processNotification, {
				pid: _process.pid,
				timeout: _timeout,
				children: [...children.values()],
			});
		}, 100);
		this._disposables.push({
			dispose: () => {
				clearInterval(interval);
			},
		});
	}

	public get stdout(): Readable | null {
		return this._process.stdout;
	}

	public get stderr(): Readable | null {
		return this._process.stderr;
	}

	private static _getChildPids(pid: number): Promise<number[]> {
		return new Promise<number[]>((resolve) => {
			psTree(pid, (err, children) => {
				if (err) {
					resolve([]);
					return;
				}
				resolve([pid, ...children.map((c) => Number(c.PID))]);
			});
		});
	}

	private static async _getCodePage(): Promise<number | null> {
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
	public static async spawnWithRobustTimeout(
		connection: _Connection,
		binStr: string,
		args: string[],
		timeout: number,
		options: SpawnSyncOptionsWithStringEncoding
	): Promise<Process> {
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
			return spawn(binStr, args, {
				...options,
				stdio: ['pipe', 'pipe', 'overlapped'],
			});
		})();

		if (proc.pid) {
			void connection.sendNotification(processNotification, {
				pid: proc.pid,
				timeout: timeout,
			});
		}

		return new this(connection, proc, timeout);
	}

	public onError(callback: (error: Error) => void): void {
		this._process.once('error', callback);
		this._disposables.push({
			dispose: () => this._process.off('error', callback),
		});
	}

	public onExit(callback: (code: number) => void): void {
		this._process.once('exit', callback);
		this._disposables.push({
			dispose: () => this._process.off('exit', callback),
		});
	}

	private async _killPid(pid: number): Promise<void> {
		if (process.platform === 'win32') {
			return new Promise<void>((resolve) => {
				const killProc = spawn('taskkill', [
					'/F',
					'/T',
					'/PID',
					pid.toString(),
				]);
				killProc.on('exit', () => {
					resolve();
				});
			});
		}
		return new Promise<void>((resolve) => {
			const killProc = spawn('kill', ['-9', pid.toString()]);
			killProc.on('exit', () => {
				resolve();
			});
		});
	}

	private async _kill(): Promise<void> {
		const childPids = new Set([...this._children.values()]);
		if (this._process.pid) {
			for (const childPid of await Process._getChildPids(
				this._process.pid
			)) {
				childPids.add(childPid);
			}
		}

		const killPromises = [...childPids.values()].map((pid) => {
			return this._killPid(pid);
		});
		if (this._process.pid) {
			killPromises.push(this._killPid(this._process.pid));
		}
		return Promise.all(killPromises).then(() => undefined);
	}

	public async dispose(): Promise<void> {
		await this._kill();
		this._disposables.forEach((d) => void d.dispose());
	}
}
