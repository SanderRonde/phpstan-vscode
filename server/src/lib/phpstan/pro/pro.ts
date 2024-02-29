import { pathExists, tryReadJSON, wait } from '../../../../../shared/util';
import type { PromisedValue, WorkspaceFolders } from '../../../server';
import type { Disposable, _Connection } from 'vscode-languageserver';
import { SPAWN_ARGS } from '../../../../../shared/constants';
import { PHPStanProErrorManager } from './proErrorManager';
import { ConfigurationManager } from '../configManager';
import { getConfiguration } from '../../config';
import type { ClassConfig } from '../manager';
import { ProcessSpawner } from '../../proc';
import { PRO_PREFIX, log } from '../../log';
import { ReturnResult } from '../result';
import * as path from 'path';
import * as os from 'os';

function getDefaultConfigDirPath(): string {
	return path.join(os.tmpdir(), 'phpstan-fixer');
}

export async function launchPro(
	connection: _Connection,
	workspaceFolders: PromisedValue<WorkspaceFolders | null>,
	classConfig: ClassConfig,
	onProgress?: (progress: {
		done: number;
		total: number;
		percentage: number;
	}) => void
): Promise<ReturnResult<PHPStanProProcess, string>> {
	const settings = await getConfiguration(connection, workspaceFolders);
	const tmpPath = settings.proTmpDir || getDefaultConfigDirPath();

	const configManager = new ConfigurationManager(classConfig);
	const launchConfig = await configManager.collectConfiguration();
	if (!launchConfig) {
		return ReturnResult.error('Failed to find launch configuration');
	}

	const [binStr, ...args] = await configManager.getArgs(launchConfig, false);
	await log(
		connection,
		PRO_PREFIX,
		'Spawning PHPStan Pro with the following configuration: ',
		JSON.stringify({
			binStr,
			args: [...args, '--watch'],
		})
	);
	const procSpawner = new ProcessSpawner(connection);
	const proc = await procSpawner.spawnWithRobustTimeout(
		binStr,
		[...args, '--watch'],
		0,
		{
			...SPAWN_ARGS,
			cwd: launchConfig.cwd,
			encoding: 'utf-8',
			env: {
				...process.env,
				TMPDIR: tmpPath,
			},
		}
	);
	configManager.dispose();

	return new Promise<ReturnResult<PHPStanProProcess, string>>((resolve) => {
		let stderr: string = '';
		proc.stdout?.on('data', (chunk: string | Buffer) => {
			const line = chunk.toString();
			const progressMatch = [
				...line.matchAll(/(\d+)\/(\d+)\s+\[.*?\]\s+(\d+)%/g),
			];
			void log(connection, PRO_PREFIX, 'PHPStan Pro: ' + line);
			if (onProgress && progressMatch.length) {
				const [, done, total, percentage] =
					progressMatch[progressMatch.length - 1];
				onProgress({
					done: parseInt(done, 10),
					total: parseInt(total, 10),
					percentage: parseInt(percentage, 10),
				});
				return;
			}
			if (line.includes('Open your web browser at:')) {
				// We got some text, the process is running.
				// Wait a slight while for PHPStan to move to the pro part
				void wait(100).then(async () => {
					// Check if config folder exists
					const configDirPath = path.join(tmpPath, 'phpstan-fixer');
					const folderExists = await pathExists(configDirPath);

					if (!folderExists) {
						resolve(
							ReturnResult.error(
								'Failed to launch PHPStan Pro (tmp folder does not exist)'
							)
						);
					} else {
						resolve(
							ReturnResult.success(
								new PHPStanProProcess(
									classConfig,
									configDirPath
								)
							)
						);
					}
				});
			}
		});
		proc.stderr?.on('data', (chunk: string | Buffer) => {
			stderr += chunk.toString();
		});
		proc.on('error', (error) => {
			resolve(
				ReturnResult.error(
					`Failed to launch PHPStan Pro: ${error.message} - ${stderr}`
				)
			);
		});
		proc.on('exit', (code) => {
			resolve(
				ReturnResult.error(
					`PHPStan Pro exited with code ${code ?? '?'}: ${stderr}`
				)
			);
		});
	});
}

class PHPStanProProcess implements Disposable {
	private _disposables: Disposable[] = [];

	public constructor(
		classConfig: ClassConfig,
		private readonly _configDirPath: string
	) {
		void this.getPort().then((port) => {
			if (!port) {
				return;
			}
			this._disposables.push(
				new PHPStanProErrorManager(classConfig, port)
			);
		});
	}

	public isLoggedIn(): Promise<boolean> {
		return pathExists(path.join(this._configDirPath, 'login_payload.jwt'));
	}

	public async getPort(): Promise<number | null> {
		const portFile = await tryReadJSON<{
			port: number;
		}>(path.join(this._configDirPath, 'port.json'));
		return portFile?.port ?? null;
	}

	public dispose(): void {
		for (const disposable of this._disposables) {
			disposable.dispose();
		}
	}
}
