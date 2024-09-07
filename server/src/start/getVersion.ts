import { ConfigurationManager } from '../lib/checkConfigManager';
import { SPAWN_ARGS } from '../../../shared/constants';
import type { ClassConfig } from '../lib/types';
import { log, SERVER_PREFIX } from '../lib/log';
import { spawn } from 'child_process';

export type PHPStanVersion = {
	minor: number;
	major: 1 | 2;
};

export async function getVersion(
	classConfig: ClassConfig
): Promise<
	| { success: true; version: PHPStanVersion }
	| { success: false; error: string }
> {
	// Test if we can get the PHPStan version
	const cwd = await ConfigurationManager.getCwd(classConfig);
	if (!cwd) {
		return {
			success: false,
			error: 'Failed to find cwd',
		};
	}

	const binConfigResult = await ConfigurationManager.getBinComand(
		classConfig,
		cwd
	);
	if (!binConfigResult.success) {
		return {
			success: false,
			error: binConfigResult.error,
		};
	}

	return new Promise((resolve) => {
		const binArgs = binConfigResult.getBinCommand(['--version']);
		const proc = spawn(binArgs[0], binArgs.slice(1), {
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
			resolve({
				success: false,
				error: `Failed to run: ${err.message}`,
			});
		});
		proc.on('close', (code) => {
			if (code !== null && code !== 0) {
				resolve({
					success: false,
					error: `Exited with exit code ${code}: ${data}`,
				});
				return;
			}

			void log(
				classConfig.connection,
				SERVER_PREFIX,
				`PHPStan version: ${data}`
			);

			const versionMatch = /(\d+)\.(\d+)/.exec(data);
			if (!versionMatch) {
				// Assume 1.* if we can't find the version (bugged in v1.12.2)
				resolve({
					success: true,
					version: {
						minor: 0,
						major: 1,
					},
				});
				return;
			}

			const [, major, minor] = versionMatch;
			resolve({
				success: true,
				version: {
					major: parseInt(major) as 1 | 2,
					minor: parseInt(minor),
				},
			});
		});
	});
}
