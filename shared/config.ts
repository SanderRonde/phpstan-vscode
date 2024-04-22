import type { GetConfigurationType } from 'vscode-generate-package-json';
import type { config } from './commands/defs';

export const CONFIG_KEYS = [
	'binPath',
	'binCommand',
	'configFile',
	'rootDir',
	'options',
	'enableStatusBar',
	'memoryLimit',
	'enabled',
	'projectTimeout',
	'suppressTimeoutMessage',
	'paths',
	'showProgress',
	'enableLanguageServer',
	'ignoreErrors',
	'suppressWorkspaceMessage',
	'pro',
	'proTmpDir',
	'checkValidity',
] as const;
// Ideally we'd use `satisifies` here but the tooling (prettier & eslint) don't seem to support it yet.
const __typeCheck: readonly (keyof ConfigSettingsWithoutPrefix)[] = CONFIG_KEYS;
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
__typeCheck;

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
};
