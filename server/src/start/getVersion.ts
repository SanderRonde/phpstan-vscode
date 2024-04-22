import { ConfigurationManager } from '../lib/checkConfigManager';
import { SPAWN_ARGS } from '../../../shared/constants';
import type { ClassConfig } from '../lib/types';
import { log, SERVER_PREFIX } from '../lib/log';
import { spawn } from 'child_process';

export type PHPStanVersion = '1.*' | '2.*';

export async function getVersion(
	classConfig: ClassConfig
): Promise<PHPStanVersion | null> {
	// Test if we can get the PHPStan version
	const cwd = await ConfigurationManager.getCwd(classConfig);
	if (!cwd) {
		return Promise.resolve(null);
	}

	const binConfig = await ConfigurationManager.getBinConfig(classConfig, cwd);
	const binPath = binConfig?.binCmd ?? binConfig?.binPath;
	if (!binPath) {
		return Promise.resolve(null);
	}

	return new Promise((resolve) => {
		const proc = spawn(binPath, ['--version'], {
			...SPAWN_ARGS,
			cwd: cwd,
		});

		let data = '';
		proc.stdout.on('data', (chunk) => {
			data += chunk;
		});
		proc.stderr.on('data', (chunk) => {
			data += chunk;
		});

		proc.on('error', (err) => {
			void log(
				classConfig.connection,
				SERVER_PREFIX,
				`Failed to get PHPStan version, is the path to your PHPStan binary correct? Error: ${err.message}`
			);
			resolve(null);
		});
		proc.on('close', (code) => {
			if (code !== 0) {
				resolve(null);
				return;
			}

			void log(
				classConfig.connection,
				SERVER_PREFIX,
				`PHPStan version: ${data}`
			);

			const versionMatch = /(\d+)\.(\d+)\.(\d+)/.exec(data);
			if (!versionMatch) {
				return;
			}

			const [, major] = versionMatch;
			if (major === '2') {
				resolve('2.*');
			} else if (major === '1') {
				resolve('1.*');
			}
		});
	});
}
