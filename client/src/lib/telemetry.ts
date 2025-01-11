// /**
//  * Contains **all** telemetry for the extension.
//  * Telemetry is only collected in order to get an insight into
//  * usage of various settings/features of the extension.
//  * No user data is collected as can be seen below.
//  */

// import type { TelemetryEventProperties } from '@vscode/extension-telemetry';
// import { TELEMETRY_CONNECTION_STRING } from '../../../shared/constants';
// import type { ConfigSettings } from '../../../shared/config';
// import type { AsyncDisposable } from '../../../shared/types';
// import TelemetryReporter from '@vscode/extension-telemetry';
// import { getEditorConfiguration } from './editorConfig';
// import { type ExtensionContext } from 'vscode';

// interface TelemetryData {
// 	version: string;
// 	usesSingleFileMode: string;
// 	usesDocker: string;
// 	usesStatusBar: string;
// 	enabled: string;
// 	usesProgress: string;
// 	usesTypeOnHover: string;
// 	usesLanguageServer: string;
// 	usesIgnoreErrors: string;
// 	ignoresMultiWorkspaceWarnings: string;
// 	usesPro: string;
// 	usesCheckValidity: string;
// }

// export class Telemetry implements AsyncDisposable {
// 	private reporter: TelemetryReporter = new TelemetryReporter(
// 		TELEMETRY_CONNECTION_STRING
// 	);

// 	public constructor() {}

// 	private _boolToString(value: boolean): string {
// 		return value ? 'true' : 'false';
// 	}

// 	public report(context: ExtensionContext): void {
// 		const editorConfig = getEditorConfiguration();
// 		const version = (context.extension.packageJSON as { version: string })
// 			.version;

// 		const getSettingUsage = (key: keyof ConfigSettings): string =>
// 			this._boolToString(!!editorConfig.get(key));

// 		const data: TelemetryData = {
// 			version,
// 			usesSingleFileMode: getSettingUsage('phpstan.singleFileMode'),
// 			usesDocker: getSettingUsage('phpstan.dockerContainerName'),
// 			usesStatusBar: getSettingUsage('phpstan.enableStatusBar'),
// 			enabled: getSettingUsage('phpstan.enabled'),
// 			usesProgress: getSettingUsage('phpstan.showProgress'),
// 			usesTypeOnHover: getSettingUsage('phpstan.showTypeOnHover'),
// 			usesLanguageServer: this._boolToString(
// 				!!editorConfig.get('phpstan.showTypeOnHover') ||
// 					!!editorConfig.get('phpstan.enableLanguageServer')
// 			),
// 			usesIgnoreErrors: this._boolToString(
// 				!!editorConfig.get('phpstan.ignoreErrors').length
// 			),
// 			ignoresMultiWorkspaceWarnings: getSettingUsage(
// 				'phpstan.suppressWorkspaceMessage'
// 			),
// 			usesPro: getSettingUsage('phpstan.pro'),
// 			usesCheckValidity: getSettingUsage('phpstan.checkValidity'),
// 		};
// 		this.reporter.sendTelemetryEvent(
// 			'launch',
// 			data as unknown as TelemetryEventProperties
// 		);
// 	}

// 	public async dispose(): Promise<void> {
// 		await this.reporter.dispose();
// 	}
// }
