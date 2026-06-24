import type { Disposable, _Connection } from 'vscode-languageserver';
import { clearCacheNotification } from '../notificationChannels';
import { ConfigurationManager } from '../checkConfigManager';
import { SPAWN_ARGS } from '../../../../shared/constants';
import type { PHPStanCheckManager } from './checkManager';
import { getEditorConfiguration } from '../editorConfig';
import type { ConfigResolver } from '../configResolver';
import { CLEAR_CACHE_PREFIX, log } from '../log';
import type { ClassConfig } from '../types';
import { spawn } from 'child_process';
import { URI } from 'vscode-uri';

const CLEAR_CACHE_TIMEOUT_MS = 60_000;

export async function clearResultCache(
	classConfig: ClassConfig,
	configResolver: ConfigResolver,
	currentFile: URI | null
): Promise<{ success: true } | { success: false; error: string }> {
	let errorMessage: string | undefined;
	const checkConfig = await ConfigurationManager.collectConfiguration(
		classConfig,
		configResolver,
		'clear-result-cache',
		currentFile,
		(error) => {
			errorMessage = error;
		}
	);
	if (!checkConfig) {
		return {
			success: false,
			error: errorMessage ?? 'Failed to collect configuration',
		};
	}

	const [binStr, ...args] = await ConfigurationManager.getArgs(
		classConfig,
		checkConfig,
		false
	);

	const env = { ...process.env };
	const configuration: Record<string, unknown> = {
		binStr,
		args,
	};
	if (checkConfig.tmpDir) {
		env.TMPDIR = checkConfig.tmpDir;
		configuration['tmpDir'] = checkConfig.tmpDir;
	}

	log(
		CLEAR_CACHE_PREFIX,
		'Clearing PHPStan result cache with the following configuration: ',
		JSON.stringify(configuration)
	);

	return new Promise((resolve) => {
		const proc = spawn(binStr, args, {
			...SPAWN_ARGS,
			cwd: checkConfig.cwd,
			env,
		});

		let output = '';
		proc.stdout.on('data', (chunk: Buffer | string) => {
			output += chunk.toString();
		});
		proc.stderr.on('data', (chunk: Buffer | string) => {
			output += chunk.toString();
		});

		const timeout = setTimeout(() => {
			proc.kill();
			resolve({
				success: false,
				error: 'Timed out while clearing PHPStan result cache',
			});
		}, CLEAR_CACHE_TIMEOUT_MS);

		proc.on('error', (err: Error) => {
			clearTimeout(timeout);
			log(
				CLEAR_CACHE_PREFIX,
				`Failed to clear PHPStan result cache: ${err.message}`
			);
			resolve({
				success: false,
				error: `Failed to run: ${err.message}`,
			});
		});

		proc.on('close', (code: number | null) => {
			clearTimeout(timeout);
			if (code !== null && code !== 0) {
				resolve({
					success: false,
					error: `Exited with exit code ${code}: ${output}`,
				});
				return;
			}

			log(CLEAR_CACHE_PREFIX, 'PHPStan result cache cleared');
			resolve({ success: true });
		});
	});
}

export function listenClearCache(
	connection: _Connection,
	classConfig: ClassConfig,
	configResolver: ConfigResolver,
	checkManager: PHPStanCheckManager | undefined,
	onConnectionInitialized: Promise<void>
): Disposable {
	return connection.onNotification(
		clearCacheNotification,
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		async ({ fileUri }) => {
			const currentFile = fileUri ? URI.parse(fileUri) : null;
			const result = await clearResultCache(
				classConfig,
				configResolver,
				currentFile
			);

			if (result.success) {
				void connection.window.showInformationMessage(
					'PHPStan result cache cleared'
				);
				checkManager?.clearCheckIfChangedCache();
				classConfig.hooks.provider.clearReport();

				await onConnectionInitialized;
				const editorConfig = await getEditorConfiguration(classConfig);
				if (
					checkManager &&
					editorConfig.enabled &&
					!editorConfig.singleFileMode
				) {
					await checkManager.checkWithDebounce(
						undefined,
						currentFile,
						'Project scan after cache clear',
						null
					);
				}
			} else {
				void connection.window.showErrorMessage(
					`Failed to clear PHPStan cache: ${result.error}`
				);
			}
		}
	);
}
