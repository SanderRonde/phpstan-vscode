import {
	CommandDefinition,
	ViewDefinition,
} from 'vscode-generate-package-json';

export enum Commands {}

export const commands: Record<string, CommandDefinition> = {};
export const views: Record<string, ViewDefinition> = {};
export const commandDefinitions = Commands;
