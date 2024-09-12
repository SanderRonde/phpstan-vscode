import type {
	ChildProcess,
	SpawnSyncOptionsWithStringEncoding,
} from 'child_process';
import { processNotification } from './notificationChannels';
import type { AsyncDisposable, ClassConfig } from './types';
import { getEditorConfiguration } from './editorConfig';
import { execute, wait } from '../../../shared/util';
import { exec, spawn } from 'child_process';
import { default as psTree } from 'ps-tree';
import type { Disposable } from 'vscode';
import type { Readable } from 'stream';

export class Process implements AsyncDisposable {
	private readonly _children: Set<number> = new Set();
	private readonly _disposables: Disposable[] = [];
	public dockerPid: number | null = null;

	public constructor(
		private readonly _classConfig: ClassConfig,
		private readonly _process: ChildProcess,
		timeout: number
	) {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises

		const updateChildPids = async (): Promise<void> => {
			if (!_process.pid) {
				return;
			}
			const children = await Process._getChildPids(_process.pid);
			children.forEach((pid) => {
				this._children.add(pid);
			});

			void this._classConfig.connection.sendNotification(
				processNotification,
				{
					pid: _process.pid,
					timeout: timeout,
					children: [...children.values()],
				}
			);
		};
		const intervals = [
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			setTimeout(updateChildPids, 0),
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			setTimeout(updateChildPids, 1000 * 10),
		];
		this._disposables.push({
			dispose: () => {
				intervals.forEach((interval) => {
					clearInterval(interval);
				});
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
			try {
				psTree(pid, (err, children) => {
					if (err) {
						resolve([]);
						return;
					}
					resolve([pid, ...children.map((c) => Number(c.PID))]);
				});
			} catch (e) {
				resolve([]);
			}
		});
	}

	private static async _getDockerChildPids(
		containerName: string,
		pid: number
	): Promise<number[]> {
		const result = await execute('docker', [
			'exec',
			containerName,
			'sh',
			'-c',
			"ls /proc | grep -E '^[0-9]+$' | xargs -I{} cat /proc/{}/stat",
		]);
		if (!result.stdout) {
			return [];
		}

		const tree = result.stdout.split('\n').map((str) => {
			const matches = /(\d+) \((.*?)\)\s(.+?)\s(\d+)\s/g.exec(str);
			if (!matches) {
				return null;
			}
			return {
				PID: matches[1],
				COMMAND: matches[2],
				STAT: matches[3],
				PPID: matches[4],
			};
		});

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
		classConfig: ClassConfig,
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
			void classConfig.connection.sendNotification(processNotification, {
				pid: proc.pid,
				timeout: timeout,
			});
		}

		return new this(classConfig, proc, timeout);
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
				killProc.on('error', () => {
					resolve();
				});
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
			killProc.on('error', () => {
				resolve();
			});
		});
	}

	private async _killDockerProcess(pid: number): Promise<Promise<void>[]> {
		const containerName = (await getEditorConfiguration(this._classConfig))
			.dockerContainerName;
		const pids = [
			pid,
			...(await Process._getDockerChildPids(containerName, pid)),
		];
		return pids.map((pid) =>
			execute('docker', [
				'exec',
				containerName,
				'kill',
				'-9',
				pid.toString(),
			]).then(() => undefined)
		);
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
			killPromises.push(
				...(await this._killDockerProcess(this.dockerPid))
			);
		}

		return Promise.all(killPromises).then(() => undefined);
	}

	public async dispose(): Promise<void> {
		await Promise.race([this._kill(), wait(1000 * 10)]);
		this._disposables.forEach((d) => void d.dispose());
	}
}
