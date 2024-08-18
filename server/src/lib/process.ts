import type {
	ChildProcess,
	SpawnSyncOptionsWithStringEncoding,
} from 'child_process';
import { processNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import { execute, wait } from '../../../shared/util';
import type { AsyncDisposable } from './types';
import { exec, spawn } from 'child_process';
import { default as psTree } from 'ps-tree';
import type { Disposable } from 'vscode';
import type { Readable } from 'stream';

export class Process implements AsyncDisposable {
	private readonly _children: Set<number> = new Set();
	private readonly _disposables: Disposable[] = [];
	public dockerPid: number | null = null;

	public constructor(
		connection: _Connection,
		private readonly _process: ChildProcess,
		timeout: number
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

			void connection.sendNotification(processNotification, {
				pid: _process.pid,
				timeout: timeout,
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

	private static async _getDockerChildPids(pid: number): Promise<number[]> {
		const result = await execute('docker', [
			'sh',
			'-c',
			"ls /proc | grep -E '^[0-9]+$' | xargs -I{} cat /proc/{}/stat",
		]);
		if (!result.success) {
			return [];
		}

		console.log(result);
		const tree = result.stdout.split('\n').map((str) => {
			const matches = str.match(/(\d+) \((.*?)\)\s(.+?)\s(\d+)\s/g);
			if (!matches) {
				return null;
			}
			return {
				PID: matches[1],
				COMMAND: matches[2],
				PPID: matches[3],
				STAT: matches[4],
			};
		});
		console.log(tree);

		const parents = new Set<string>([pid.toString()]);
		const children = new Set<string>();
		for (const proc of tree) {
			if (!proc) {
				continue;
			}
			if (parents.has(proc.PPID)) {
				parents.add(proc.PID);
				children.add(proc.PID);
			}
		}
		console.log(parents, children);

		return [...children.values()].map((pid) => Number(pid));
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

	private async _killDockerProcess(pid: number): Promise<void> {
		console.log(await Process._getDockerChildPids(pid));
		await execute('docker', ['kill', '-9', pid.toString()]);
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

		if (this.dockerPid) {
			killPromises.push(this._killDockerProcess(this.dockerPid));
		}

		return Promise.all(killPromises).then(() => undefined);
	}

	public async dispose(): Promise<void> {
		await Promise.race([this._kill(), wait(1000 * 10)]);
		this._disposables.forEach((d) => void d.dispose());
	}
}
