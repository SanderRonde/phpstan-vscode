import type { GetConfigurationType } from 'vscode-generate-package-json';
import type { config } from './commands/defs';

export type ConfigSettingsWithoutPrefix = {
	[K in keyof ConfigSettings as K extends `phpstan.${infer R}`
		? R
		: unknown]: ConfigSettings[K];
};
export type ConfigSettings = Omit<
	GetConfigurationType<typeof config>,
	'phpstan.ignoreErrors' | 'phpstan.enableLanguageServer'
> & {
	'phpstan.ignoreErrors': (string | RegExp)[];
	// Legacy setting
	'phpstan.proTmpDir'?: string;
	/** @deprecated */
	'phpstan.enableLanguageServer'?: boolean;
};

export type DockerConfigSettings = {
	'docker.environment': Record<string, string>;
};

export type ExternalConfigSettings = DockerConfigSettings;
