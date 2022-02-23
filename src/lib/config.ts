import {
	ConfigurationTarget,
	window,
	workspace,
	WorkspaceConfiguration,
} from 'vscode';

export enum WhenToRun {
	ON_SAVE = 'onSave',
	CONTENT_CHANGE = 'onContentChange',
	NEVER = 'never',
}

interface ConfigSettings {
	'phpstan.binPath': string | null;
	'phpstan.configFile': string | null;
	'phpstan.rootDir': string | null;
	'phpstan.options': string[];
	'phpstan.enableStatusBar': boolean;
	'phpstan.memoryLimit': string;
	'phpstan.whenToRun': WhenToRun;
}

interface TypedWorkspaceConfiguration<T> extends WorkspaceConfiguration {
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

export function getConfiguration(): TypedWorkspaceConfiguration<ConfigSettings> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}
