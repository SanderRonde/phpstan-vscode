import { pathExists, tryReadJSON, wait } from '../../../../../shared/util';
import type { Disposable, _Connection } from 'vscode-languageserver';
import { SPAWN_ARGS } from '../../../../../shared/constants';
import { PHPStanProErrorManager } from './proErrorManager';
import { ConfigurationManager } from '../configManager';
import type { PromisedValue } from '../../../server';
import { replaceVariables } from '../../variables';
import { getConfiguration } from '../../config';
import { SERVER_PREFIX, log } from '../../log';
import type { ClassConfig } from '../manager';
import { ProcessSpawner } from '../../proc';
import { ReturnResult } from '../result';
import type { URI } from 'vscode-uri';
import * as path from 'path';
import * as os from 'os';

function getDefaultConfigDirPath(): string {
	return path.join(os.tmpdir(), 'phpstan-fixer');
}

export async function launchPro(
	connection: _Connection,
	getWorkspaceFolder: PromisedValue<URI | null>,
	classConfig: ClassConfig
): Promise<ReturnResult<PHPStanProProcess, string>> {
	const settings = await getConfiguration(connection, getWorkspaceFolder);
	const tmpPath = await replaceVariables(
		settings.proTmpDir || getDefaultConfigDirPath(),
		classConfig
	);

	const configManager = new ConfigurationManager(classConfig);
	void log(
		connection,
		SERVER_PREFIX,
		'Getting config=' + JSON.stringify(settings)
	);
	const launchConfig = await configManager.collectConfiguration();
	if (!launchConfig) {
		return ReturnResult.error('Failed to find launch configuration');
	}

	const [binStr, ...args] = await configManager.getArgs(launchConfig, false);
	const procSpawner = new ProcessSpawner(connection);
	const proc = await procSpawner.spawnWithRobustTimeout(
		binStr,
		[...args, '--watch'],
		0,
		{
			...SPAWN_ARGS,
			cwd: launchConfig.cwd,
			env: {
				...process.env,
				TMPDIR: tmpPath,
			},
		}
	);
	configManager.dispose();

	return new Promise<ReturnResult<PHPStanProProcess, string>>((resolve) => {
		let stdout: string = '';
		let stderr: string = '';
		proc.stdout.on('data', (chunk: string | Buffer) => {
			stdout += chunk.toString();
			if (stdout.includes('Open your web browser at:')) {
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
		proc.stderr.on('data', (chunk: string | Buffer) => {
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
