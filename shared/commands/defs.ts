import type {
	CommandDefinition,
	ViewDefinition,
	ConfigurationDefinition,
} from 'vscode-generate-package-json';

export enum Commands {
	SCAN_PROJECT = 'phpstan.scanProjectForErrors',
	RELOAD = 'phpstan.reload',
	NEXT_ERROR = 'phpstan.nextError',
	PREVIOUS_ERROR = 'phpstan.previousError',
}

export const commands: Record<Commands, CommandDefinition> = {
	[Commands.SCAN_PROJECT]: {
		title: 'Scan project for errors',
		inCommandPalette: true,
	},
	[Commands.RELOAD]: {
		title: 'Reload language server',
		inCommandPalette: true,
	},
	[Commands.NEXT_ERROR]: {
		title: 'Go to next error',
		inCommandPalette: true,
	},
	[Commands.PREVIOUS_ERROR]: {
		title: 'Go to previous error',
		inCommandPalette: true,
	},
};

export const config = {
	'phpstan.binPath': {
		jsonDefinition: {
			type: 'string',
			default: 'vendor/bin/phpstan',
			description: 'Path to the PHPStan binary',
		},
	},
	'phpstan.binCommand': {
		jsonDefinition: {
			type: 'array',
			examples: [['phpstan'], ['lando', 'phpstan']],
			items: {
				type: 'string',
			},
			description:
				'PHPStan command. Use this instead of "binPath" if, for example, the phpstan binary is in your path',
		},
	},
	'phpstan.configFile': {
		jsonDefinition: {
			type: 'string',
			default: 'phpstan.neon',
			examples: [
				'phpstan.neon',
				'backend/phpstan.neon',
				'phpstan.neon,phpstan.neon.dist',
			],
			description:
				'Path to the config file (leave empty to disable, use a comma-separated list to resolve in order)',
		},
	},
	'phpstan.paths': {
		jsonDefinition: {
			type: 'object',
			default: {},
			__shape: '' as unknown as Record<string, string>,
			examples: [
				{
					'/path/to/hostFolder': '/path/in/dockerContainer',
				},
			],
			description:
				'Path mapping for scanned files. Allows for rewriting paths for for example SSH or Docker.',
		},
	},
	'phpstan.rootDir': {
		jsonDefinition: {
			type: 'string',
			description: 'Path to the root directory',
		},
	},
	'phpstan.options': {
		jsonDefinition: {
			type: 'array',
			default: [],
			items: {
				type: 'string',
			},
			description:
				'Extra commandline options to be passed to PHPStan. Supports substituting ${workspaceFolder}',
		},
	},
	'phpstan.enableStatusBar': {
		jsonDefinition: {
			type: 'boolean',
			default: true,
			description: 'Show the status bar while scanning',
		},
	},
	'phpstan.memoryLimit': {
		jsonDefinition: {
			type: 'string',
			default: '1G',
			description: 'Memory limit to use',
		},
	},
	'phpstan.enabled': {
		jsonDefinition: {
			type: 'boolean',
			description: 'Whether to enable the on-save checker',
			default: true,
		},
	},
	'phpstan.timeout': {
		jsonDefinition: {
			type: 'number',
			description:
				'Timeout in milliseconds for a single file check. After this time the checking process is canceled',
			default: 10000,
		},
	},
	'phpstan.projectTimeout': {
		jsonDefinition: {
			type: 'number',
			description:
				'Timeout in milliseconds for a full project check. After this time the checking process is canceled',
			default: 60000,
		},
	},
	'phpstan.suppressTimeoutMessage': {
		jsonDefinition: {
			type: 'boolean',
			description: 'Stop showing an error when the operation times out',
			default: false,
		},
	},
	'phpstan.showProgress': {
		jsonDefinition: {
			type: 'boolean',
			description: 'Stop showing an error when the operation times out',
			default: false,
		},
	},
	'phpstan.enableLanguageServer': {
		jsonDefinition: {
			type: 'boolean',
			description:
				'Enable language server that provides on-hover information. Disable this if you have a custom PHPStan binary that runs on another filesystem (such as Docker)',
			default: true,
		},
	},
	'phpstan.ignoreErrors': {
		jsonDefinition: {
			type: 'array',
			description:
				"An array of regular expressions to ignore in PHPStan's error output. If PHPStan outputs some warnings/errors in stderr that can be ignored, put them in here and they'll no longer cause the process to exit with an error.",
			default: [],
			items: {
				type: 'string',
			},
			examples: [['Xdebug: .*']],
		},
	},
	'phpstan.suppressWorkspaceMessage': {
		jsonDefinition: {
			type: 'boolean',
			description:
				'Stop showing an error when using a multi-workspace project',
			default: false,
		},
	},
} as const;

export const views: Record<string, ViewDefinition> = {};
export const commandDefinitions = Commands;
export const configuration = config as Record<string, ConfigurationDefinition>;
