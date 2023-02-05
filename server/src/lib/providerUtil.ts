import type { ProviderArgs } from '../providers/shared';
import { getConfiguration } from './config';

export async function providerEnabled(
	providerArgs: ProviderArgs
): Promise<boolean> {
	const configuration = await getConfiguration(
		providerArgs.connection,
		providerArgs.getWorkspaceFolder
	);
	return (
		configuration.enableLanguageServer &&
		configuration.enabled &&
		Object.keys(configuration.paths).length <= 0
	);
}
