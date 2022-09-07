import type { ConfigurationTarget, WorkspaceConfiguration } from 'vscode';

export interface PHPStanConfig {
	binPath: string | null;
	binCommand: string[] | null;
	configFile: string | null;
	rootDir: string | null;
	options: string[];
	enableStatusBar: boolean;
	memoryLimit: string;
	enabled: boolean;
	timeout: number;
	projectTimeout: number;
	suppressTimeoutMessage: boolean;
	paths: Record<string, string>;
	showProgress: boolean;
	enableLanguageServer: boolean;
	ignoreErrors: string[];
}

export type ConfigSettings = {
	[K in keyof PHPStanConfig as `phpstan.${K}`]: PHPStanConfig[K];
};

export interface TypedWorkspaceConfiguration<T> extends WorkspaceConfiguration {
	get<K extends Extract<keyof T, string>>(
		section: K,
		defaultValue: T[K]
	): T[K];
	get<K extends Extract<keyof T, string>>(section: K): T[K];
	get<K extends Extract<keyof T, string>>(
		section: K,
		defaultValue?: T[K]
	): T[K];
	has<K extends Extract<keyof T, string>>(section: K): boolean;
	update<K extends Extract<keyof T, string>>(
		section: K,
		value: T[K],
		configurationTarget?: ConfigurationTarget | boolean | null,
		overrideInLanguage?: boolean
	): Thenable<void>;
}
