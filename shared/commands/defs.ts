import type {
	CommandDefinition,
	ViewDefinition,
} from 'vscode-generate-package-json';

export enum Commands {
	SCAN_CURRENT_FOR_ERRORS = 'phpstan.scanFileForErrors',
	SCAN_PROJECT = 'phpstan.scanProjectForErrors',
	RELOAD = 'phpstan.reload',
}

export const commands: Record<Commands, CommandDefinition> = {
	[Commands.SCAN_CURRENT_FOR_ERRORS]: {
		title: 'Scan current file for errors',
		inCommandPalette: true,
	},
	[Commands.SCAN_PROJECT]: {
		title: 'Scan project for errors',
		inCommandPalette: true,
	},
	[Commands.RELOAD]: {
		title: 'Reload language server',
		inCommandPalette: true,
	},
};
export const views: Record<string, ViewDefinition> = {};
export const commandDefinitions = Commands;
