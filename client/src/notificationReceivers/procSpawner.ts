import { processNotification } from '../lib/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import type { Disposable, ExtensionContext } from 'vscode';
import { PROCESS_SPAWNER_PREFIX, log } from '../lib/log';
import { lookup, kill } from 'ps-node';

interface ProcessDescriptor {
	timeout: number;
	binStr: string;
}

export class ProcessSpawner implements Disposable {
	private static STORAGE_KEY = 'phpstan.processes';
	private _disposables: Disposable[] = [];

	public constructor(
		client: LanguageClient,
		private readonly _context: ExtensionContext
	) {
		this._kill(true);
		this._disposables.push(
			client.onNotification(processNotification, ({ pid, timeout }) => {
				log(
					PROCESS_SPAWNER_PREFIX,
					'Spawning process',
					String(pid),
					'with timeout',
					String(timeout)
				);
				lookup({ pid }, (err, list) => {
					if (err || !list.length) {
						void this._pushPid(pid, timeout);
						return;
					}

					void this._pushPid(pid, timeout, list[0].command);
				});
			})
		);
		const interval = setInterval(() => this._kill(), 1000 * 60 * 30);
		this._disposables.push({
			dispose: () => clearInterval(interval),
		});
	}

	private _procExists(pid: number): boolean {
		try {
			process.kill(pid, 0);
			return true;
		} catch (e) {
			return false;
		}
	}

	private async _killProc(pid: number, binStr?: string): Promise<void> {
		if (!this._procExists(pid)) {
			return;
		}
		lookup({ pid }, (err, list) => {
			if (err || list.length === 0) {
				// No longer exists or something went wrong
				return;
			}

			list.forEach(async (proc) => {
				if (binStr && proc.command !== binStr) {
					return;
				}

				kill(proc.pid, 'SIGINT', (err) => {
					if (err) {
						kill(proc.pid, 'SIGKILL');
					}
				});
			});
		});
	}

	private _kill(killTimeoutless: boolean = false): void {
		const processes = this._context.workspaceState.get(
			ProcessSpawner.STORAGE_KEY,
			{}
		) as Record<number, number | ProcessDescriptor>;
		if (Object.keys(processes).length === 0) {
			return;
		}

		const killed: number[] = [];
		Object.entries(processes).forEach(([pid, data]) => {
			const descriptor =
				typeof data === 'number'
					? { timeout: data, binStr: undefined }
					: data;
			if (
				Date.now() > descriptor.timeout &&
				(descriptor.timeout !== 0 || killTimeoutless)
			) {
				const pidNum = parseInt(pid, 10);
				killed.push(pidNum);
				void this._killProc(pidNum, descriptor.binStr);
			}
		});

		const newProcesses: Record<number, number | ProcessDescriptor> = {};
		for (const pid in processes) {
			if (killed.includes(parseInt(pid, 10))) {
				continue;
			}
			newProcesses[pid] = processes[pid];
		}
		void this._context.workspaceState.update(
			ProcessSpawner.STORAGE_KEY,
			newProcesses
		);
	}

	private async _pushPid(
		pid: number,
		timeout: number,
		binStr?: string
	): Promise<void> {
		const targetTime = timeout === 0 ? 0 : Date.now() + timeout;
		await this._context.workspaceState.update(ProcessSpawner.STORAGE_KEY, {
			...this._context.workspaceState.get(ProcessSpawner.STORAGE_KEY, {}),
			[pid]: binStr
				? {
						timeout: targetTime,
						binStr,
					}
				: targetTime,
		});
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
	}
}
