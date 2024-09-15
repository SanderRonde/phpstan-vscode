// eslint-disable-next-line node/no-extraneous-import
import type { TypedWorkspaceConfiguration } from 'vscode-generate-package-json/dist/types/src/configuration';

import type {
	ConfigSettings,
	ConfigWithoutPrefix,
	DeprecatedConfigSettings,
} from '../../../shared/config';
import type { LanguageClient } from 'vscode-languageclient/node';
import { watcherNotification } from './notificationChannels';
import { window, workspace } from 'vscode';
import { CLIENT_PREFIX, log } from './log';

export function getReadonlyEditorConfiguration(): ConfigWithoutPrefix<ConfigSettings> {
	const document = window.activeTextEditor?.document;

	const configuration = workspace
		.getConfiguration(undefined, document?.uri)
		.get('phpstan') as ConfigWithoutPrefix<ConfigSettings> &
		ConfigWithoutPrefix<DeprecatedConfigSettings>;
	return {
		...configuration,
		configFiles: configuration.configFile
			? [configuration.configFile]
			: configuration.configFiles,
	};
}

export function getWritableEditorConfiguration(): Omit<
	TypedWorkspaceConfiguration<ConfigSettings>,
	'get'
> {
	const document = window.activeTextEditor?.document;

	if (document) {
		return workspace.getConfiguration(undefined, document.uri);
	}

	return workspace.getConfiguration();
}

export function registerEditorConfigurationListener(
	client: LanguageClient
): void {
	log(
		CLIENT_PREFIX,
		'Starting extension with configuration:',
		JSON.stringify(getReadonlyEditorConfiguration(), null, '\t')
	);

	workspace.onDidChangeConfiguration(async (e) => {
		if (!e.affectsConfiguration('phpstan')) {
			return;
		}

		await client.sendNotification(watcherNotification, {
			operation: 'onConfigChange',
			file: null,
		});

		if (e.affectsConfiguration('phpstan.paths')) {
			const editorConfig = getReadonlyEditorConfiguration();
			const paths = editorConfig.paths;
			if (editorConfig.showTypeOnHover && Object.keys(paths).length > 0) {
				await window.showWarningMessage(
					'On-hover type information is disabled when the paths setting is being used'
				);
			}
		} else if (
			e.affectsConfiguration('phpstan.pro') ||
			e.affectsConfiguration('phpstan.proTmpDir') ||
			(e.affectsConfiguration('phpstan.enabled') &&
				getReadonlyEditorConfiguration().pro)
		) {
			await window.showInformationMessage(
				'Please reload your editor for changes to the PHPStan Pro configuration to take effect'
			);
		}
	});
}
