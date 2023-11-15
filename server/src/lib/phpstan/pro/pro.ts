import { pathExists, tryReadJSON, wait } from '../../../../../shared/util';
import type { Disposable, _Connection } from 'vscode-languageserver';
import { SPAWN_ARGS } from '../../../../../shared/constants';
import type { WorkspaceFolderGetter } from '../../../server';
import { PHPStanProErrorManager } from './proErrorManager';
import { ConfigurationManager } from '../configManager';
import { getConfiguration } from '../../config';
import type { ClassConfig } from '../manager';
import { ProcessSpawner } from '../../proc';
import { ReturnResult } from '../result';
import * as path from 'path';
import * as os from 'os';

function getDefaultConfigDirPath(): string {
	return path.join(os.tmpdir(), 'phpstan-fixer');
}

export async function launchPro(
	connection: _Connection,
	getWorkspaceFolder: WorkspaceFolderGetter,
	classConfig: ClassConfig
): Promise<ReturnResult<PHPStanProProcess, string>> {
	const settings = await getConfiguration(connection, getWorkspaceFolder);
	const configDirPath = settings.proTmpDir || getDefaultConfigDirPath();

	const configManager = new ConfigurationManager(classConfig);
	const launchConfig = await configManager.collectConfiguration();
	if (!launchConfig) {
		return ReturnResult.error('Failed to find launch configuration');
	}

	const [binStr, ...args] = await configManager.getArgs(launchConfig, false);
	const procSpawner = new ProcessSpawner(connection);
	const process = await procSpawner.spawnWithRobustTimeout(
		binStr,
		[...args, '--watch'],
		0,
		{
			...SPAWN_ARGS,
			cwd: launchConfig.cwd,
			env: {
				TMPDIR: configDirPath,
			},
		}
	);
	configManager.dispose();

	return new Promise<ReturnResult<PHPStanProProcess, string>>((resolve) => {
		let data: string = '';
		process.stdout.on('data', (chunk: string | Buffer) => {
			data += chunk.toString();
			if (data.trim().length) {
				// We got some text, the process is running.
				// Wait a slight while for PHPStan to move to the pro part
				void wait(100).then(async () => {
					// Check if config folder exists
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
		process.on('error', (error) => {
			resolve(
				ReturnResult.error(
					`Failed to launch PHPStan Pro: ${error.message}`
				)
			);
		});
		process.on('exit', (code) => {
			resolve(
				ReturnResult.error(
					`PHPStan Pro exited with code ${code ?? '?'}`
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
