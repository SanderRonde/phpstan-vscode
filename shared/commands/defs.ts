import type {
	CommandDefinition,
	ViewDefinition,
	ConfigurationDefinition,
} from 'vscode-generate-package-json';

export enum Commands {
	SCAN_FILE_FOR_ERRORS = 'phpstan.scanFileForErrors',
	SCAN_PROJECT = 'phpstan.scanProjectForErrors',
	RELOAD = 'phpstan.reload',
	NEXT_ERROR = 'phpstan.nextError',
	PREVIOUS_ERROR = 'phpstan.previousError',
	OPEN_PHPSTAN_PRO = 'phpstan.openPhpstanPro',
	LAUNCH_SETUP = 'phpstan.launchSetup',
}

export const commands: Record<Commands, CommandDefinition> = {
	[Commands.SCAN_FILE_FOR_ERRORS]: {
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
	[Commands.NEXT_ERROR]: {
		title: 'Go to next error',
		inCommandPalette: true,
	},
	[Commands.PREVIOUS_ERROR]: {
		title: 'Go to previous error',
		inCommandPalette: true,
	},
	[Commands.OPEN_PHPSTAN_PRO]: {
		title: 'Open PHPStan Pro in browser',
		inCommandPalette: true,
	},
	[Commands.LAUNCH_SETUP]: {
		title: 'Launch setup',
		inCommandPalette: true,
	},
};

export const config = {
	'phpstan.singleFileMode': {
		jsonDefinition: {
			type: 'boolean',
			description:
				"Whether to scan only the file that is being saved, instead of the whole project. This is not recommended since it busts the cache. Only use this if your computer can't handle a full-project scan",
			default: false,
		},
	},
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
			default: 'phpstan.neon,phpstan.neon.dist,phpstan.dist.neon',
			examples: [
				'phpstan.neon',
				'backend/phpstan.neon',
				'phpstan.neon,phpstan.neon.dist',
			],
			description:
				'Path to the config file (use a comma-separated list to resolve in order)',
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
				'Path mapping for scanned files. Allows for rewriting paths for for example Docker.',
		},
	},
	'phpstan.dockerContainerName': {
		jsonDefinition: {
			type: 'string',
			description: 'Name of the Docker container to use for scanning',
			examples: ['docker-phpstan-php-1'],
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
	'phpstan.projectTimeout': {
		jsonDefinition: {
			type: 'number',
			description:
				'Timeout in milliseconds for a full project check. After this time the checking process is canceled',
			default: 300000,
		},
	},
	'phpstan.timeout': {
		jsonDefinition: {
			type: 'number',
			description:
				'Timeout in milliseconds for a file check. After this time the checking process is canceled',
			default: 300000,
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
			description:
				'Show the progress bar when performing a single-file check',
			default: false,
		},
	},
	'phpstan.showTypeOnHover': {
		jsonDefinition: {
			type: 'boolean',
			description:
				'Show type information on hover. Disable this if you have a custom PHPStan binary that runs on another filesystem (such as Docker) or if you run into caching problems. Does not work with PHPStan Pro enabled or for PHPStan version < 1.8.0.',
			default: false,
		},
	},
	'phpstan.enableLanguageServer': {
		jsonDefinition: {
			type: 'boolean',
			description:
				'Enable language server that provides on-hover type information. Disable this if you have a custom PHPStan binary that runs on another filesystem (such as Docker) or if you run into caching problems. Does not work with PHPStan Pro enabled or for PHPStan version < 1.8.0.',
			default: false,
			deprecationMessage: 'Use phpstan.showTypeOnHover instead',
		},
	},
	'phpstan.ignoreErrors': {
		jsonDefinition: {
			type: 'array',
			description:
				"An array of regular expressions to ignore in PHPStan's error output. If PHPStan outputs some warnings/errors in stderr that can be ignored, put them in here and they'll no longer cause the process to exit with an error.",
			default: ['Xdebug: .*'],
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
	'phpstan.pro': {
		jsonDefinition: {
			type: 'boolean',
			description:
				'Use PHPStan Pro under the hood (if you have a license)',
			default: false,
		},
	},
	'phpstan.tmpDir': {
		jsonDefinition: {
			type: 'string',
			description:
				'Path to the PHPStan TMP directory. Lets PHPStan determine the TMP directory if not set.',
		},
	},
	'phpstan.checkValidity': {
		jsonDefinition: {
			type: 'boolean',
			description:
				'Check the validity of the PHP code before checking it with PHPStan. This is recommended only if you have autoSave enabled or for some other reason save syntactically invalid code. PHPStan tends to invalidate its cache when checking an invalid file, leading to a slower experience.',
			default: false,
		},
	},
} as const;

export const views: Record<string, ViewDefinition> = {};
export const commandDefinitions = Commands;
export const configuration = config as Record<string, ConfigurationDefinition>;
