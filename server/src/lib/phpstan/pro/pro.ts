import { pathExists, tryReadJSON, wait } from '../../../../../shared/util';
import { ConfigurationManager } from '../../checkConfigManager';
import { SPAWN_ARGS } from '../../../../../shared/constants';
import { getEditorConfiguration } from '../../editorConfig';
import { PHPStanProErrorManager } from './proErrorManager';
import type { Disposable } from 'vscode-languageserver';
import type { ClassConfig } from '../../types';
import { ReturnResult } from '../../result';
import { PRO_PREFIX, log } from '../../log';
import { Process } from '../../process';
import * as path from 'path';

export async function launchPro(
	classConfig: ClassConfig,
	onProgress?: (progress: {
		done: number;
		total: number;
		percentage: number;
	}) => void
): Promise<ReturnResult<PHPStanProProcess, string>> {
	const settings = await getEditorConfiguration(classConfig);
	const tmpPath = settings.tmpDir;

	const launchConfig = await ConfigurationManager.collectConfiguration(
		classConfig,
		'analyse',
		null
	);
	if (!launchConfig) {
		return ReturnResult.error('Failed to find launch configuration');
	}

	const [binStr, ...args] = await ConfigurationManager.getArgs(
		classConfig,
		launchConfig,
		false
	);
	const env = { ...process.env };
	const configuration: Record<string, unknown> = {
		binStr,
		args: [...args, '--watch'],
	};
	if (tmpPath) {
		env.TMPDIR = tmpPath;
		configuration['tmpDir'] = tmpPath;
	}
	await log(
		classConfig.connection,
		PRO_PREFIX,
		'Spawning PHPStan Pro with the following configuration: ',
		JSON.stringify(configuration)
	);
	const proc = await Process.spawnWithRobustTimeout(
		classConfig,
		binStr,
		[...args, '--watch'],
		0,
		{
			...SPAWN_ARGS,
			cwd: launchConfig.cwd,
			encoding: 'utf-8',
			env: env,
		}
	);

	return new Promise<ReturnResult<PHPStanProProcess, string>>((resolve) => {
		let stderr: string = '';
		proc.stdout?.on('data', (chunk: string | Buffer) => {
			const line = chunk.toString();
			const progressMatch = [
				...line.matchAll(/(\d+)\/(\d+)\s+\[.*?\]\s+(\d+)%/g),
			];
			void log(
				classConfig.connection,
				PRO_PREFIX,
				'PHPStan Pro: ' + line
			);
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
								`Failed to launch PHPStan Pro (tmp folder does not exist: "${configDirPath}"). Does the \`phpstan.tmpDir\` setting match the tmpDir in your config file?`
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
		proc.onError((error) => {
			resolve(
				ReturnResult.error(
					`Failed to launch PHPStan Pro: ${error.message} - ${stderr}`
				)
			);
		});
		proc.onExit((code) => {
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
