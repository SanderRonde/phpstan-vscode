import type { PHPStanConfig } from '../../../shared/config';
import type { _Connection } from 'vscode-languageserver';

export function getConfiguration(connection: _Connection): Promise<{
	phpstan: PHPStanConfig;
}> {
	return connection.workspace.getConfiguration() as Promise<{
		phpstan: PHPStanConfig;
	}>;
}
