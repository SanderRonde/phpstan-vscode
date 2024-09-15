import type { GetConfigurationType } from 'vscode-generate-package-json';
import type { config } from './commands/defs';

export type ConfigWithoutPrefix<S extends Record<string, unknown>> = {
	[K in keyof S as K extends `phpstan.${infer R}` ? R : never]: S[K];
};
export type ConfigSettings = Omit<
	GetConfigurationType<typeof config>,
	'phpstan.ignoreErrors' | 'phpstan.enableLanguageServer'
> & {
	'phpstan.ignoreErrors': (string | RegExp)[];
};

/** @deprecated */
export type DeprecatedConfigSettings = {
	// Legacy setting
	'phpstan.proTmpDir'?: string;
	'phpstan.enableLanguageServer'?: boolean;
	'phpstan.configFile'?: string;
	'phpstan.rootDir'?: string;
};
