import { processNotification } from '../lib/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import type { Disposable, ExtensionContext } from 'vscode';
import { PROCESS_SPAWNER_PREFIX, log } from '../lib/log';
import type { Program } from 'ps-node';
import { lookup, kill } from 'ps-node';

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
					log(
						this._context,
						PROCESS_SPAWNER_PREFIX,
						'Spawning process',
						String(pid),
						'with timeout',
						String(timeout)
					);
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
		lookup({ pid }, (err, list) => {
			if (err || list.length === 0) {
				// No longer exists or something went wrong
				return;
			}

			list.forEach((proc) => {
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

		const programs =
			toKill.length > 0
				? await new Promise<Program[]>((resolve) => {
						lookup(
							{
								pid: toKill.map(({ pid }) => pid),
							},
							(err, list) => {
								if (err) {
									resolve([]);
								} else {
									resolve(list);
								}
							}
						);
					})
				: [];

		for (const { descriptor, pid } of toKill) {
			const program = programs.find(
				(p) =>
					p.pid === parseInt(pid, 10) &&
					(descriptor.binStr === undefined ||
						p.command === descriptor.binStr)
			);
			if (program) {
				void this._killProc(parseInt(pid, 10), program.command);
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
		const programs = await new Promise<Program[]>((resolve) => {
			lookup(
				{
					pid: [String(pid), ...children.map(String)],
				},
				(err, list) => {
					if (err) {
						resolve([]);
					} else {
						resolve(list);
					}
				}
			);
		});

		const binStr = programs.find((p) => p.pid === pid)?.command;
		const childBinStrs = children.map((child) => {
			const program = programs.find((p) => p.pid === child);
			return program?.command;
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
