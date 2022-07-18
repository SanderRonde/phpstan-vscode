import { getConfiguration, onChangeConfiguration } from './config';
import type { _Connection } from 'vscode-languageserver';
import type { Disposable } from 'vscode';

function pathsEnabled(paths: Record<string, string>): boolean {
	return Object.keys(paths).length > 0;
}

export interface ProviderEnabled {
	isEnabled: () => Promise<boolean>;
}

export function providerEnabled(
	connection: _Connection,
	onConnectionInitialized: Promise<void>,
	disposables: Disposable[]
): ProviderEnabled {
	let enabled: Promise<boolean> = onConnectionInitialized.then(() => {
		return getConfiguration(connection).then(
			(config) => !pathsEnabled(config.phpstan.paths)
		);
	});
	void onConnectionInitialized.then(() => {
		disposables.push(
			onChangeConfiguration(connection, 'paths', (paths) => {
				enabled = Promise.resolve(!pathsEnabled(paths));
			})
		);
	});

	return {
		isEnabled(): Promise<boolean> {
			return enabled;
		},
	};
}
