import { processNotification } from '../lib/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import type { Disposable, ExtensionContext } from 'vscode';
import { PROCESS_SPAWNER_PREFIX, log } from '../lib/log';
import { default as psTree } from 'ps-tree';

interface ProcessDescriptor {
	pid: number;
	binStr: string | undefined;
}

interface RootProcessDescriptor extends ProcessDescriptor {
	timeout: number;
	children?: ProcessDescriptor[];
}

export class ZombieKiller implements Disposable {
	private static STORAGE_KEY = 'phpstan.processes.v1';
	private _disposables: Disposable[] = [];

	public constructor(
		client: LanguageClient,
		private readonly _context: ExtensionContext
	) {
		void this._kill(true);
		this._disposables.push(
			client.onNotification(
				processNotification,
				({ pid, children, timeout }) => {
					const currentPids = this._context.workspaceState.get<
						Record<number, RootProcessDescriptor | number>
					>(ZombieKiller.STORAGE_KEY, {});
					if (!currentPids[pid]) {
						log(
							this._context,
							PROCESS_SPAWNER_PREFIX,
							'Spawning process',
							String(pid),
							'with timeout',
							String(timeout)
						);
					}
					void this._pushPid(pid, children ?? [], timeout);
				}
			)
		);
		const interval = setInterval(() => void this._kill(), 1000 * 60 * 30);
		this._disposables.push({
			dispose: () => clearInterval(interval),
		});
	}

	private _killPid(pid: number): void {
		try {
			process.kill(pid, 'SIGINT');
		} catch {
			try {
				process.kill(pid, 'SIGKILL');
			} catch {
				// Already gone
			}
		}
	}

	private _killProcTree(pid: number): void {
		this._killPid(pid);
		psTree(pid, (err, children) => {
			if (err) {
				return;
			}
			children.forEach((proc) => {
				this._killPid(Number(proc.PID));
			});
		});
	}

	private _asDescriptor(
		pid: number,
		value: RootProcessDescriptor | number | undefined
	): RootProcessDescriptor | null {
		if (typeof value === 'number') {
			return {
				pid,
				timeout: value,
				binStr: undefined,
				children: [],
			};
		}
		if (value && typeof value === 'object') {
			return {
				pid: value.pid ?? pid,
				timeout: value.timeout,
				binStr: value.binStr,
				children: value.children ?? [],
			};
		}
		return null;
	}

	private async _kill(killTimeoutless: boolean = false): Promise<void> {
		const processes = this._context.workspaceState.get(
			ZombieKiller.STORAGE_KEY,
			{}
		) as Record<number, RootProcessDescriptor | number>;
		if (Object.keys(processes).length === 0) {
			return;
		}

		const toKill = new Set<number>();
		const pidsToRemove = new Set<string>();
		Object.entries(processes).forEach(([pid, value]) => {
			const descriptor = this._asDescriptor(Number(pid), value);
			if (!descriptor) {
				return;
			}
			if (
				killTimeoutless ||
				(descriptor.timeout !== 0 && Date.now() > descriptor.timeout)
			) {
				pidsToRemove.add(pid);
				toKill.add(descriptor.pid);
				if (descriptor.children) {
					descriptor.children.forEach((child) => {
						toKill.add(child.pid);
					});
				}
			}
		});

		for (const pid of toKill) {
			this._killProcTree(pid);
		}

		const newProcesses: Record<number, RootProcessDescriptor | number> = {};
		for (const pid in processes) {
			if (pidsToRemove.has(pid)) {
				continue;
			}
			newProcesses[Number(pid)] = processes[pid];
		}
		await this._context.workspaceState.update(
			ZombieKiller.STORAGE_KEY,
			newProcesses
		);
	}

	private async _pushPid(
		pid: number,
		children: number[],
		timeout: number
	): Promise<void> {
		const targetTime = timeout === 0 ? 0 : Date.now() + timeout;
		const current = this._context.workspaceState.get<
			Record<number, RootProcessDescriptor | number>
		>(ZombieKiller.STORAGE_KEY, {});
		await this._context.workspaceState.update(ZombieKiller.STORAGE_KEY, {
			...current,
			[pid]: {
				timeout: targetTime,
				binStr: undefined,
				pid,
				children: children.map((childPid) => ({
					pid: childPid,
					binStr: undefined,
				})),
			} satisfies RootProcessDescriptor,
		});
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
	}
}
