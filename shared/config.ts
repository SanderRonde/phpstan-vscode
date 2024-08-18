import type { GetConfigurationType } from 'vscode-generate-package-json';
import type { config } from './commands/defs';

export type ConfigSettingsWithoutPrefix = {
	[K in keyof ConfigSettings as K extends `phpstan.${infer R}`
		? R
		: unknown]: ConfigSettings[K];
};
export type ConfigSettings = Omit<
	GetConfigurationType<typeof config>,
	'phpstan.ignoreErrors'
> & {
	'phpstan.ignoreErrors': (string | RegExp)[];
	// Legacy setting
	'phpstan.proTmpDir'?: string;
};
