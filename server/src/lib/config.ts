import type { Disposable, _Connection } from 'vscode-languageserver';
import type { PHPStanConfig } from '../../../shared/config';

export function getConfiguration(connection: _Connection): Promise<{
	phpstan: PHPStanConfig;
}> {
	return connection.workspace.getConfiguration() as Promise<{
		phpstan: PHPStanConfig;
	}>;
}

export function onChangeConfiguration<K extends keyof PHPStanConfig>(
	connection: _Connection,
	key: K,
	handler: (value: PHPStanConfig[K]) => void
): Disposable {
	void getConfiguration(connection).then((config) => {
		handler(config.phpstan[key]);
	});
	return connection.onDidChangeConfiguration(() => {
		void getConfiguration(connection).then((config) => {
			handler(config.phpstan[key]);
		});
	});
}
