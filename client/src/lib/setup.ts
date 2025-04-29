import {
	assertUnreachable,
	getConfigFile,
	pathExists,
	docker,
	getPathMapper,
} from '../../../shared/util';
import type { WatcherNotificationFileData } from '../../../shared/notificationChannels';
import { replaceHomeDir, replaceVariables } from '../../../shared/variables';
import type { InputStep, QuickPickParameters } from './multiStepInput';

import {
	commands,
	ConfigurationTarget,
	ThemeIcon,
	Uri,
	window,
	workspace,
} from 'vscode';
import type {
	ConfigSettings,
	ConfigSettingsWithoutPrefix,
} from '../../../shared/config';
import type { QuickInputButton, QuickPickItem, WorkspaceFolder } from 'vscode';
import type { WorkspaceFolders } from '../../../server/src/lib/types';
import type { LanguageClient } from 'vscode-languageclient/node';
import { getEditorConfiguration } from './editorConfig';
import { config } from '../../../shared/commands/defs';
import { testRunRequest } from './requestChannels';
import { MultiStepInput } from './multiStepInput';
import { findFiles } from './files';
import * as path from 'path';

enum SetupMethod {
	Automatic = 'automatic',
	Commandline = 'commandline',
	Docker = 'docker',
	// TODO: maybe do this at some point
	// Lando = 'lando',
	Other = 'other',
}

interface SetupChoice extends QuickPickItem {
	method: SetupMethod;
}

type State = {
	-readonly [K in keyof ConfigSettingsWithoutPrefix]: ConfigSettingsWithoutPrefix[K];
};

const TITLE = 'PHPStan setup';
export async function launchSetup(client: LanguageClient): Promise<void> {
	const editorConfig = getEditorConfiguration();
	const state = {} as State;
	for (const key in config) {
		let value = editorConfig.get(key as keyof ConfigSettings);
		if (typeof value === 'object' && value && !Array.isArray(value)) {
			// Objects are proxies so we need to clone them
			value = { ...value };
		}
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
		(state as any)[key.slice('phpstan.'.length) as any] = value;
	}
	const applyStateStep = async (): Promise<void> => {
		for (const _key in state) {
			const key = _key as keyof State;
			await editorConfig.update(
				`phpstan.${key}`,
				state[key],
				ConfigurationTarget.Workspace
			);
		}
	};

	const setupMethodStep = async (
		input: MultiStepInput
	): Promise<InputStep | undefined> => {
		const choice = await input.showQuickPick<
			SetupChoice,
			QuickPickParameters<SetupChoice>
		>({
			title: TITLE,
			items: [
				{
					label: 'Automatically',
					description: 'Resolve config file(s) automatically',
					method: SetupMethod.Automatic,
				},
				{
					label: 'Directly through commandline',
					description: 'e.g. `./vendor/bin/phpstan analyse`',
					method: SetupMethod.Commandline,
				},
				{
					label: 'Through docker',
					description:
						'e.g. docker exec -it my-phpstan-container phpstan analyse',
					method: SetupMethod.Docker,
				},
				// {
				// 	label: 'Through lando',
				// 	description: 'e.g. lando phpstan analyse',
				// 	method: SetupMethod.Lando,
				// },
				{
					label: 'Something else',
					method: SetupMethod.Other,
				},
			],
			step: 0,
			placeholder: 'How are you running PHPStan?',
			ignoreFocusOut: true,
		});

		if (!choice) {
			return;
		}

		if (choice.method === SetupMethod.Other) {
			const actionChoice = await window.showInformationMessage(
				'No setup has been configured for this method yet. Please manually configure the settings or open an issue on the GitHub repository.',
				'Open GitHub'
			);
			if (actionChoice === 'Open GitHub') {
				void commands.executeCommand(
					'vscode.open',
					Uri.parse(
						'https://github.com/SanderRonde/phpstan-vscode#configuration'
					)
				);
			}
			return;
		}

		const keyedWorkspaceFolders = toKeyedWorkspaceFolders(
			workspace.workspaceFolders
		);
		if (choice.method === SetupMethod.Commandline) {
			const setup = new CommandlineSetupSteps(
				client,
				state,
				keyedWorkspaceFolders
			);
			return setup.run(applyStateStep);
		} else if (choice.method === SetupMethod.Docker) {
			const setup = new DockerSetupSteps(
				client,
				state,
				keyedWorkspaceFolders
			);
			return setup.run(applyStateStep);
		} else if (choice.method === SetupMethod.Automatic) {
			const setup = new AutomaticSetupSteps(
				client,
				state,
				keyedWorkspaceFolders
			);
			return setup.run(async () => {
				await applyStateStep();
				await window.showInformationMessage(
					'Resolving of config files happens automatically, check the language status in the status bar (the {} icon) for progress.'
				);
			});
		}
		return;
	};

	await MultiStepInput.run(setupMethodStep);
}

function toKeyedWorkspaceFolders(
	workspaceFolders: readonly WorkspaceFolder[] | null | undefined
): WorkspaceFolders | null {
	const uri = workspaceFolders?.[0].uri;
	if (uri) {
		const initializedFolders: WorkspaceFolders = {
			byName: {},
			getForPath: (filePath: string) => {
				return workspace.getWorkspaceFolder(Uri.file(filePath))?.uri;
			},
		};
		if (workspaceFolders?.length === 1) {
			initializedFolders.default = uri;
		}
		for (const folder of workspaceFolders ?? []) {
			initializedFolders.byName[folder.name] = folder.uri;
		}
		return initializedFolders;
	}

	return null;
}

const makeAbsolute = (filePath: string, cwd: string | undefined): string => {
	if (path.isAbsolute(filePath) || !cwd) {
		return filePath;
	}
	return path.join(cwd, filePath);
};

const SHOW_FILE_PICKER_BUTTON = {
	iconPath: new ThemeIcon('file-symlink-directory'),
	tooltip: 'Open file picker',
} as const satisfies QuickInputButton;

abstract class SetupSteps {
	protected abstract _localState:
		| {
				lastFoundLocalConfigFile: string | null;
		  }
		| undefined;

	public constructor(
		protected readonly _client: LanguageClient,
		protected readonly _state: State,
		protected readonly _workspaceFolders: WorkspaceFolders | null
	) {}

	protected _getCwd(): string | undefined {
		return this._workspaceFolders?.default?.fsPath;
	}

	protected async _rootDirStep(
		input: MultiStepInput,
		next: InputStep,
		shouldValidateInitially?: boolean
	): Promise<InputStep | undefined> {
		const choice = await input.showInputBoxWithButton({
			title: TITLE,
			prompt: 'Enter the path to the root directory',
			validate: async (value) => {
				const rootDir = makeAbsolute(
					replaceHomeDir(
						replaceVariables(value, this._workspaceFolders)
					),
					this._getCwd()
				);
				if (await pathExists(rootDir)) {
					return undefined;
				}
				return `Directory does not exist at \`${rootDir}\``;
			},
			value: this._state.rootDir,
			ignoreFocusOut: true,
			buttons: [SHOW_FILE_PICKER_BUTTON],
			shouldValidateInitially,
		});
		if (typeof choice === 'string') {
			this._state.rootDir = choice;
			return next;
		}

		const folder = await window.showOpenDialog({
			canSelectFolders: true,
			canSelectFiles: false,
			canSelectMany: false,
			title: 'Select root directory',
		});
		if (folder) {
			if (this._workspaceFolders?.default?.fsPath === folder[0].fsPath) {
				this._state.rootDir = './';
			} else if (this._workspaceFolders?.default) {
				this._state.rootDir = path.relative(
					this._workspaceFolders.default.fsPath,
					folder[0].fsPath
				);
			} else {
				this._state.rootDir = folder[0].fsPath;
			}
		}
		return (input) => this._rootDirStep(input, next, true);
	}

	protected async _configFileStep(
		input: MultiStepInput,
		next: InputStep,
		shouldValidateInitially?: boolean
	): Promise<InputStep | undefined> {
		const choice = await input.showInputBoxWithButton({
			title: TITLE,
			prompt: 'Enter the path to the config file (relative to root dir or absolute, can be a comma-separated list)',
			validate: async (value) => {
				const filePath = replaceHomeDir(
					replaceVariables(value, this._workspaceFolders)
				);
				const configFile = await getConfigFile(
					filePath,
					makeAbsolute(this._state.rootDir, this._getCwd()),
					pathExists
				);
				if (configFile) {
					if (this._localState) {
						this._localState.lastFoundLocalConfigFile = configFile;
					}
					return undefined;
				}
				return `File does not exist container at \`${filePath}\``;
			},
			value: this._state.configFile,
			ignoreFocusOut: true,
			buttons: [SHOW_FILE_PICKER_BUTTON],
			shouldValidateInitially,
		});

		if (typeof choice === 'string') {
			this._state.configFile = choice;
			return next;
		}

		const file = await window.showOpenDialog({
			canSelectFolders: false,
			canSelectFiles: true,
			canSelectMany: false,
			title: 'Select config file',
		});
		if (file) {
			this._state.configFile = this._workspaceFolders?.default
				? path.relative(
						this._workspaceFolders.default.fsPath,
						file[0].fsPath
					)
				: file[0].fsPath;
		}
		return (input) => this._configFileStep(input, next, true);
	}

	protected async _binPathStep(
		input: MultiStepInput,
		next: InputStep,
		shouldValidateInitially?: boolean
	): Promise<InputStep | undefined> {
		const choice = await input.showInputBoxWithButton({
			title: TITLE,
			prompt: 'Enter the path to the PHPStan binary (relative to root dir, absolute or relative to workspace i.e. "${workspaceFolder:Primary}/vendor/bin/phpstan)"',
			validate: async (value) => {
				const filePath = makeAbsolute(
					path.join(
						this._state.rootDir,
						replaceHomeDir(
							replaceVariables(value, this._workspaceFolders)
						)
					),
					this._getCwd()
				);

				if (!(await pathExists(filePath))) {
					return `File does not exist at \`${filePath}\``;
				}

				return undefined;
			},
			value:
				this._state.binPath ??
				path.join(
					makeAbsolute(this._state.rootDir, this._getCwd()),
					'vendor/bin/phpstan'
				),
			ignoreFocusOut: true,
			buttons: [SHOW_FILE_PICKER_BUTTON],
		});

		if (typeof choice === 'string') {
			this._state.binPath = choice;
			return next;
		}

		const file = await window.showOpenDialog({
			canSelectFolders: false,
			canSelectFiles: true,
			canSelectMany: false,
			title: 'Select PHPStan binary',
		});
		if (file) {
			this._state.binPath = this._workspaceFolders?.default
				? path.relative(
						this._workspaceFolders.default.fsPath,
						file[0].fsPath
					)
				: file[0].fsPath;
		}
		return (input) =>
			this._binPathStep(input, next, shouldValidateInitially);
	}

	protected async _singleFileModeStep(
		input: MultiStepInput,
		next: InputStep
	): Promise<InputStep | undefined> {
		const singleFileModeText =
			"Lighter on the CPU, only use this is if your device can't handle full-project checks";
		this._state.singleFileMode =
			(
				await input.showQuickPick({
					title: TITLE,
					placeholder:
						'Check only current file or check all files in project?',
					items: [
						{
							label: 'Check all files',
							description:
								'Ensures cache is preserved, project-wide errors are shown and improves accuracy',
						},
						{
							label: 'Check only current file',
							description: singleFileModeText,
						},
					],
					ignoreFocusOut: true,
				})
			).label === singleFileModeText;

		return next;
	}

	protected async _testStep(
		input: MultiStepInput,
		next: InputStep
	): Promise<InputStep | undefined> {
		const testSetupText = 'Test setup';
		const acceptText = 'Accept current setup without testing';
		const cancelText = 'Cancel';
		const options = [
			{
				label: testSetupText,
			} as const,
			{
				label: acceptText,
			} as const,
			{
				label: cancelText,
			} as const,
		];
		const choice = await input.showQuickPick<
			(typeof options)[number],
			QuickPickParameters<(typeof options)[number]>
		>({
			title: TITLE,
			placeholder: 'Test current setup by running PHPStan?',
			items: options,
			ignoreFocusOut: true,
		});

		if (choice.label === cancelText) {
			return;
		} else if (choice.label === testSetupText) {
			// Run PHPStan in dry-run mode (just get the version)
			const dryRunResult = await this._client.sendRequest(
				testRunRequest,
				{
					...this._state,
					dryRun: true,
				}
			);
			if (!dryRunResult.success) {
				void window.showErrorMessage(
					`Failed to run PHPStan: ${dryRunResult.error}`
				);
				return (input) => this._testStep(input, next);
			}

			const testConfig: State & {
				file?: WatcherNotificationFileData;
			} = { ...this._state };
			if (this._state.singleFileMode) {
				const options = await findFiles('**/*.php');
				const choice = await window.showQuickPick(
					options.map((uri) => ({
						label: path.relative(
							makeAbsolute(
								this._state.rootDir,
								this._workspaceFolders?.default?.fsPath
							),
							uri.fsPath
						),
						file: uri,
					})),
					{
						title: 'Select a file to run PHPStan on',
					}
				);
				if (!choice) {
					return (input) => this._testStep(input, next);
				}
				const file = await workspace.openTextDocument(choice.file);
				testConfig.file = {
					content: file.getText(),
					languageId: file.languageId,
					uri: file.uri.toString(),
				};
			}

			// Run PHPStan for real
			const realRunResult = await this._client.sendRequest(
				testRunRequest,
				{
					...testConfig,
					dryRun: false,
				}
			);
			if (!realRunResult.success) {
				void window.showErrorMessage(
					`Failed to run PHPStan: ${realRunResult.error}`
				);
				return (input) => this._testStep(input, next);
			}
			void window.showInformationMessage('Test run successful!');
			return next;
		} else if (choice.label === acceptText) {
			return next;
		} else {
			assertUnreachable(choice);
		}
	}

	protected async _proStep(
		input: MultiStepInput,
		next: InputStep
	): Promise<InputStep | undefined> {
		const enableText = 'Yes, enable PHPStan pro';
		this._state.pro =
			(
				await input.showQuickPick({
					title: TITLE,
					placeholder: 'Use PHPStan pro?',
					items: [
						{
							label: 'No',
						},
						{
							label: enableText,
						},
					],
					ignoreFocusOut: true,
				})
			).label === enableText;

		return next;
	}
}

class AutomaticSetupSteps extends SetupSteps {
	protected _localState = undefined;

	private async _configFilePatternStep(
		input: MultiStepInput,
		next: InputStep
	): Promise<InputStep | undefined> {
		const choice = await input.showInputBoxWithButton({
			title: TITLE,
			prompt: 'Enter the file name(s) of config files. Can be a comma-separated list. Example: `phpstan.neon,phpstan.neon.dist` finds `**/{phpstan.neon,phpstan.neon.dist}`',
			validate: () => Promise.resolve(undefined),
			value: this._state.configFile,
			ignoreFocusOut: true,
		});

		if (typeof choice === 'string') {
			this._state.configFile = choice;
			return next;
		}
		return (input) => this._configFilePatternStep(input, next);
	}

	public run(next: () => Promise<void>): Promise<InputStep> {
		// Unset this as it's not relevant for commandline mode
		this._state.dockerContainerName = '';

		return Promise.resolve((input: MultiStepInput) =>
			this._configFilePatternStep(input, (input) =>
				this._binPathStep(input, (input) => this._testStep(input, next))
			)
		);
	}
}

class CommandlineSetupSteps extends SetupSteps {
	protected _localState = undefined;

	public run(next: () => Promise<void>): Promise<InputStep> {
		// Unset this as it's not relevant for commandline mode
		this._state.dockerContainerName = '';

		return Promise.resolve((input: MultiStepInput) =>
			this._rootDirStep(input, (input) =>
				this._configFileStep(input, (input) =>
					this._binPathStep(input, (input) =>
						this._singleFileModeStep(input, (input) =>
							this._testStep(input, (input) =>
								this._proStep(input, next)
							)
						)
					)
				)
			)
		);
	}
}

class DockerSetupSteps extends SetupSteps {
	protected _localState: {
		lastFoundLocalConfigFile: string | null;
		lastFoundDockerConfigFile: string | null;
	} = {
		lastFoundLocalConfigFile: null,
		lastFoundDockerConfigFile: null,
	};
	private async _dockerPathExists(path: string): Promise<boolean> {
		return (
			await docker(
				[
					'exec',
					this._state.dockerContainerName,
					'sh',
					'-c',
					`[ -f ${path} ]`,
				],
				getEditorConfiguration().get('docker.environment')
			)
		).success;
	}

	private async _getDockerCwd(): Promise<string> {
		return (
			await docker(
				['exec', this._state.dockerContainerName, 'pwd'],
				getEditorConfiguration().get('docker.environment')
			)
		).stdout.trim();
	}

	private async _dockerContainerNameStep(
		input: MultiStepInput,
		next: InputStep
	): Promise<InputStep> {
		const { stdout, success } = await docker(
			['ps', '-a', '--format', '{{json .Names}}'],
			getEditorConfiguration().get('docker.environment')
		);
		const dockerContainers = success
			? stdout
					.trim()
					.split('\n')
					.map((line) => line.trim().slice(1, -1))
					.filter(Boolean)
			: [];
		const dockerContainerOptions = dockerContainers.map((c) => ({
			label: c,
		}));

		const choice = await input.showQuickPick(
			{
				title: TITLE,
				placeholder: 'What is the name of your docker container',
				items: dockerContainerOptions,
				ignoreFocusOut: true,
				activeItem: dockerContainerOptions.find(
					(option) => option.label === this._state.dockerContainerName
				),
			},
			true
		);
		this._state.dockerContainerName =
			typeof choice === 'string' ? choice : choice.label;

		const containerExists = (
			await docker(
				['exec', this._state.dockerContainerName, 'echo', '1'],
				getEditorConfiguration().get('docker.environment')
			)
		).success;

		if (containerExists) {
			return next;
		}

		void window.showWarningMessage(
			`Docker container \`${this._state.dockerContainerName}\` does not exist or is not running.`
		);
		return (input) => this._dockerContainerNameStep(input, next);
	}

	protected override async _binPathStep(
		input: MultiStepInput,
		next: InputStep,
		shouldValidateInitially?: boolean
	): Promise<InputStep | undefined> {
		const choice = await input.showInputBoxWithButton({
			title: TITLE,
			prompt: 'Enter the path to the PHPStan binary (relative to root dir or absolute)',
			validate: async (value) => {
				const filePath = makeAbsolute(
					path.join(
						this._state.rootDir,
						replaceHomeDir(
							replaceVariables(value, this._workspaceFolders)
						)
					),
					this._getCwd()
				);

				const mapper = getPathMapper(this._state.paths, this._getCwd());
				const mappedPath = mapper(filePath);

				if (!(await this._dockerPathExists(mappedPath))) {
					return `File does not exist in docker container at \`${mappedPath}\``;
				}

				return undefined;
			},
			value:
				this._state.binPath ??
				path.join(
					makeAbsolute(this._state.rootDir, this._getCwd()),
					'vendor/bin/phpstan'
				),
			ignoreFocusOut: true,
			buttons: [SHOW_FILE_PICKER_BUTTON],
		});

		if (typeof choice === 'string') {
			this._state.binPath = choice;
			return next;
		}

		const file = await window.showOpenDialog({
			canSelectFolders: false,
			canSelectFiles: true,
			canSelectMany: false,
			title: 'Select PHPStan binary',
		});
		if (file) {
			this._state.binPath = this._workspaceFolders?.default
				? path.relative(
						this._workspaceFolders.default.fsPath,
						file[0].fsPath
					)
				: file[0].fsPath;
		}
		return (input) =>
			this._binPathStep(input, next, shouldValidateInitially);
	}

	private async _dockerConfigFileStep(
		input: MultiStepInput,
		next: InputStep
	): Promise<InputStep> {
		await input.showInputBoxWithButton({
			title: TITLE,
			prompt: 'Enter the path to the config file in your docker container (relative to mounting point or absolute, can be a comma-separated list)',
			validate: async (value) => {
				const filePath = replaceHomeDir(
					replaceVariables(value, this._workspaceFolders)
				);
				const configFile = await getConfigFile(
					filePath,
					await this._getDockerCwd(),
					this._dockerPathExists.bind(this)
				);
				if (!configFile) {
					return `File does not exist at \`${filePath}\``;
				}
				this._localState.lastFoundDockerConfigFile = configFile;
				return undefined;
			},
			value: this._state.configFile,
			ignoreFocusOut: true,
		});

		// We can use this to establish a path mapping.
		const localConfigFileparts = path.posix
			.normalize(this._localState.lastFoundLocalConfigFile!)
			.split(path.posix.sep);
		const dockerConfigFileparts = path.posix
			.normalize(this._localState.lastFoundDockerConfigFile!)
			.split(path.posix.sep);

		let i = 0;
		const maxLength = Math.min(
			localConfigFileparts.length,
			dockerConfigFileparts.length
		);
		for (i = 0; i < maxLength; i++) {
			if (
				localConfigFileparts[localConfigFileparts.length - i] !==
				dockerConfigFileparts[dockerConfigFileparts.length - i]
			) {
				break;
			}
		}

		const cwd = this._getCwd();
		const localPath = localConfigFileparts
			.slice(0, -(i - 1))
			.join(path.posix.sep);
		const localPathRelative = cwd
			? path.relative(cwd, localPath)
			: localPath;
		this._state.paths[localPathRelative] = dockerConfigFileparts
			.slice(0, -(i - 1))
			.join(path.posix.sep);
		return next;
	}

	public run(next: () => Promise<void>): Promise<InputStep> {
		return Promise.resolve((input: MultiStepInput) =>
			this._dockerContainerNameStep(input, (input) =>
				this._rootDirStep(input, (input) =>
					this._configFileStep(input, (input) =>
						this._dockerConfigFileStep(input, (input) =>
							this._binPathStep(input, (input) =>
								this._singleFileModeStep(input, (input) =>
									this._testStep(input, (input) =>
										this._proStep(input, next)
									)
								)
							)
						)
					)
				)
			)
		);
	}
}
