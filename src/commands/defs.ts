import {
	CommandDefinition,
	ViewDefinition,
} from 'vscode-generate-package-json';

export enum Commands {
	SCAN_CURRENT_FOR_ERRORS = 'phpstan.scanFileForErrors',
}

export const commands: Record<Commands, CommandDefinition> = {
	[Commands.SCAN_CURRENT_FOR_ERRORS]: {
		title: 'Scan current file for errors',
		inCommandPalette: true,
	},
};
export const views: Record<string, ViewDefinition> = {};
export const commandDefinitions = Commands;
