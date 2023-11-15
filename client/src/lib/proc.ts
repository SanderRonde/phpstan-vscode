import type { LanguageClient } from 'vscode-languageclient/node';
import { processNotification } from './notificationChannels';
import type { Disposable, ExtensionContext } from 'vscode';
import { wait } from '../../../shared/util';

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
				console.log('pushing pid', pid, timeout);
				void this._pushPid(pid, timeout);
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

	private async _killProc(pid: number): Promise<void> {
		if (!this._procExists(pid)) {
			return;
		}
		try {
			process.kill(pid, 'SIGINT');
			// eslint-disable-next-line no-empty
		} catch (e) {}
		await wait(5000);
		try {
			process.kill(pid, 'SIGKILL');
			// eslint-disable-next-line no-empty
		} catch (e) {}
	}

	private _kill(killTimeoutless: boolean = false): void {
		const processes = this._context.workspaceState.get(
			ProcessSpawner.STORAGE_KEY,
			{}
		) as Record<number, number>;
		if (Object.keys(processes).length === 0) {
			return;
		}

		const killed: number[] = [];
		Object.entries(processes).forEach(([pid, timeout]) => {
			if (Date.now() > timeout && (timeout !== 0 || killTimeoutless)) {
				const pidNum = parseInt(pid, 10);
				killed.push(pidNum);
				console.log('killing', pid, 'because', timeout, 'is over');
				void this._killProc(pidNum);
			}
		});

		const newProcesses: Record<number, number> = {};
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

	private async _pushPid(pid: number, timeout: number): Promise<void> {
		await this._context.workspaceState.update(ProcessSpawner.STORAGE_KEY, {
			...this._context.workspaceState.get(ProcessSpawner.STORAGE_KEY, {}),
			[pid]: timeout === 0 ? 0 : Date.now() + timeout,
		});
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
	}
}
