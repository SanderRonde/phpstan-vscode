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
						Record<number, RootProcessDescriptor>
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

	private _killProc(pid: number, binStr?: string): void {
		psTree(pid, (err, children) => {
			if (err || children.length === 0) {
				// No longer exists or something went wrong
				return;
			}

			children.forEach((proc) => {
				if (binStr && proc.COMMAND !== binStr) {
					return;
				}

				try {
					process.kill(Number(proc.PID), 'SIGINT');
				} catch (e) {
					process.kill(Number(proc.PID), 'SIGKILL');
				}
			});
		});
	}

	private async _kill(killTimeoutless: boolean = false): Promise<void> {
		const processes = this._context.workspaceState.get(
			ZombieKiller.STORAGE_KEY,
			{}
		) as Record<number, RootProcessDescriptor>;
		if (Object.keys(processes).length === 0) {
			return;
		}

		const toKill: { descriptor: ProcessDescriptor; pid: string }[] = [];
		Object.entries(processes).forEach(([pid, descriptor]) => {
			if (
				killTimeoutless ||
				(Date.now() > descriptor.timeout && descriptor.timeout !== 0)
			) {
				toKill.push({
					descriptor,
					pid,
				});
				if (descriptor.children) {
					descriptor.children.forEach((child) => {
						toKill.push({
							descriptor: child,
							pid,
						});
					});
				}
			}
		});

		const programs: psTree.PS[] = [];
		await Promise.all(
			toKill.map(
				async ({ pid }) =>
					new Promise<void>((resolve) => {
						psTree(Number(pid), (err, children) => {
							if (!err) {
								programs.push(...children);
							}
							resolve();
						});
					})
			)
		);

		for (const { descriptor, pid } of toKill) {
			const program = programs.find(
				(p) =>
					p.PID === pid &&
					(descriptor.binStr === undefined ||
						p.COMMAND === descriptor.binStr)
			);
			if (program) {
				void this._killProc(parseInt(pid, 10), program.COMMAND);
			}
		}

		const newProcesses: Record<number, number | RootProcessDescriptor> = {};
		for (const pid in processes) {
			if (toKill.some(({ pid: pid2 }) => pid2 === pid)) {
				continue;
			}
			newProcesses[pid] = processes[pid];
		}
		void this._context.workspaceState.update(
			ZombieKiller.STORAGE_KEY,
			newProcesses
		);
	}

	private async _pushPid(
		pid: number,
		children: number[],
		timeout: number
	): Promise<void> {
		const programs = await new Promise<readonly psTree.PS[]>((resolve) => {
			psTree(pid, (err, list) => {
				if (err) {
					resolve([]);
				} else {
					resolve(list);
				}
			});
		});

		const binStr = programs.find((p) => p.PID === String(pid))?.COMMAND;
		const childBinStrs = children.map((child) => {
			const program = programs.find((p) => p.PID === String(child));
			return program?.COMMAND;
		});

		const targetTime = timeout === 0 ? 0 : Date.now() + timeout;
		await this._context.workspaceState.update(ZombieKiller.STORAGE_KEY, {
			...this._context.workspaceState.get(ZombieKiller.STORAGE_KEY, {}),
			[pid]: binStr
				? ({
						timeout: targetTime,
						binStr,
						pid,
						children: children.map((pid, i) => ({
							pid: pid,
							binStr: childBinStrs[i],
						})),
					} satisfies RootProcessDescriptor)
				: targetTime,
		});
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
	}
}
