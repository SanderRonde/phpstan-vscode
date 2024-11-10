import type {
	StatusBarProgress,
	WatcherNotificationFileData,
} from '../../../../shared/notificationChannels';
import { OperationStatus } from '../../../../shared/statusBar';
import { ConfigurationManager } from '../checkConfigManager';
import type { AsyncDisposable, ClassConfig } from '../types';
import { errorNotification } from '../notificationChannels';
import type { PHPStanCheckResult } from './processRunner';
import type { CheckConfig } from '../checkConfigManager';
import { getEditorConfiguration } from '../editorConfig';
import { getPathMapper } from '../../../../shared/util';
import type { ConfigResolver } from '../configResolver';
import { PHPStanRunner } from './processRunner';
import { ReturnResult } from '../result';
import { checkPrefix } from '../log';
import { URI } from 'vscode-uri';
import * as os from 'os';

export type ProgressListener = (progress: StatusBarProgress) => void;

const IN_CONTEXT_OF_PREFIX = ' (in context of';
export class PHPStanCheck implements AsyncDisposable {
	private static _lastCheckId: number = 1;
	private _done: boolean = false;
	private _disposed: boolean = false;
	private _progressListeners: ProgressListener[] = [];
	private _id: number = PHPStanCheck._lastCheckId++;
	public disposables: AsyncDisposable[] = [];

	public get id(): number {
		return this._id;
	}

	public get done(): boolean {
		return this._done;
	}

	public constructor(
		private readonly _classConfig: ClassConfig,
		private readonly _configResolver: ConfigResolver
	) {}

	private _onProgress(progress: StatusBarProgress): void {
		this._progressListeners.forEach((c) => c(progress));
	}

	private _parseOutput(output: PHPStanCheckResult): ReportedErrors {
		const notFileSpecificErrors: string[] = output.errors;
		const fileSpecificErrors: ReportedErrors['fileSpecificErrors'] = {};
		for (const key in output.files) {
			let filePath = key;
			let messagePostfix = '';

			// PHPStan reports error in the context of traits as errors in separate
			// files postfixed with some string. We remove this postfix and join
			// the errors with the original file, moving the postfix to the message instead.
			const contextIndex = key.indexOf(IN_CONTEXT_OF_PREFIX);
			if (contextIndex !== -1) {
				filePath = key.split(IN_CONTEXT_OF_PREFIX)[0];
				messagePostfix = key.slice(contextIndex);
			}
			fileSpecificErrors[filePath] = [
				...(fileSpecificErrors[filePath] ?? []),
				...output.files[key].messages.map((message) => ({
					message: message.message + messagePostfix,
					lineNumber: message.line,
					ignorable: message.ignorable,
					identifier: message.identifier ?? null,
					tip: message.tip ?? null,
				})),
			];
		}

		return {
			fileSpecificErrors,
			notFileSpecificErrors,
		};
	}

	private _escapeFilePath(filePath: string): string {
		if (os.platform() !== 'win32') {
			return filePath;
		}
		if (filePath.indexOf(' ') !== -1) {
			filePath = '"' + filePath + '"';
		}
		return filePath;
	}

	private async _checkFile(
		check: PHPStanCheck,
		runner: PHPStanRunner,
		checkConfig: CheckConfig,
		pathMapper: (filePath: string, inverse?: boolean | undefined) => string,
		file: WatcherNotificationFileData,
		onError: null | ((error: string) => void)
	): Promise<ReturnResult<ReportedErrors>> {
		// Get file
		const filePath = await ConfigurationManager.applyPathMapping(
			this._classConfig,
			URI.parse(file.uri).fsPath,
			checkConfig.cwd
		);

		const result = await runner.runProcess<PHPStanCheckResult>(
			{
				...checkConfig,
				args: [...checkConfig.args, this._escapeFilePath(filePath)],
			},
			checkPrefix(check),
			true,
			{
				onError: onError,
			}
		);

		return result.chain((output) => {
			const parsed = this._parseOutput(output);

			const normalized: ReportedErrors = {
				// Even if there are no errors we set the key so partial
				// application will overwrite it to an empty array.
				fileSpecificErrors: {
					[file.uri]: [],
				},
				notFileSpecificErrors: parsed.notFileSpecificErrors,
			};
			for (const filePath in parsed.fileSpecificErrors) {
				normalized.fileSpecificErrors[
					URI.file(pathMapper(filePath, true)).toString()
				] = parsed.fileSpecificErrors[filePath];
			}
			return normalized;
		});
	}

	private async _checkProject(
		check: PHPStanCheck,
		runner: PHPStanRunner,
		checkConfig: CheckConfig,
		pathMapper: (filePath: string, inverse?: boolean | undefined) => string,
		onProgress: ProgressListener,
		onError: null | ((error: string) => void)
	): Promise<ReturnResult<ReportedErrors>> {
		const result = await runner.runProcess<PHPStanCheckResult>(
			checkConfig,
			checkPrefix(check),
			true,
			{
				onProgress,
				onError,
			}
		);

		return result.chain((output) => {
			const parsed = this._parseOutput(output);

			// Turn raw fs paths into URIs
			const normalized: ReportedErrors = {
				fileSpecificErrors: {},
				notFileSpecificErrors: parsed.notFileSpecificErrors,
			};
			for (const filePath in parsed.fileSpecificErrors) {
				normalized.fileSpecificErrors[
					URI.file(pathMapper(filePath, true)).toString()
				] = parsed.fileSpecificErrors[filePath];
			}
			return normalized;
		});
	}

	public async check(
		applyErrors: boolean,
		onError: null | ((error: string) => void),
		currentFile: URI | null,
		file?: WatcherNotificationFileData
	): Promise<ReturnResult<ReportedErrors>> {
		// Get config
		const checkConfig = await ConfigurationManager.collectConfiguration(
			this._classConfig,
			this._configResolver,
			'analyse',
			currentFile,
			onError
		);
		if (!checkConfig) {
			return ReturnResult.error();
		}

		const errorManager = new PHPStanCheckErrorManager(this._classConfig);
		const pathMapper = getPathMapper(
			(await getEditorConfiguration(this._classConfig)).paths,
			checkConfig.workspaceRoot
		);
		const runner = new PHPStanRunner(this._classConfig);
		this.disposables.push(runner);

		if (this._disposed) {
			return ReturnResult.canceled();
		}

		const result = await (() => {
			if (file) {
				return this._checkFile(
					this,
					runner,
					checkConfig,
					pathMapper,
					file,
					onError
				);
			} else {
				return this._checkProject(
					this,
					runner,
					checkConfig,
					pathMapper,
					this._onProgress.bind(this),
					onError
				);
			}
		})();
		if (applyErrors) {
			await errorManager.handleResult(
				result,
				checkConfig.configFile,
				!!file
			);
		}

		await this.dispose();
		this._done = true;

		return result;
	}

	public onProgress(callback: (progress: StatusBarProgress) => void): void {
		this._progressListeners.push(callback);
	}

	public async dispose(): Promise<void> {
		await Promise.all(this.disposables.map((d) => d.dispose()));
		this._progressListeners = [];
		this.disposables = [];
		this._disposed = true;
	}
}

class PHPStanCheckErrorManager {
	private static _lastErrors: Map<string, ReportedErrors> = new Map();

	public constructor(
		private readonly _config: Pick<ClassConfig, 'connection'>
	) {}

	private async _showErrors(errors: ReportedErrors): Promise<void> {
		await this._config.connection.sendNotification(errorNotification, {
			diagnostics: errors,
		});
	}

	private _getErrors(
		result: ReturnResult<ReportedErrors>,
		configFile: string,
		isPartial: boolean
	): ReportedErrors | null {
		if (result.status === OperationStatus.ERROR) {
			return {
				fileSpecificErrors: {},
				notFileSpecificErrors: [],
			};
		} else if (!result.success()) {
			return null;
		}

		const reportedErrors = result.value;

		const errors: ReportedErrors = {
			fileSpecificErrors: {},
			notFileSpecificErrors: [],
		};

		/**
		 * Merge errors from different config files.
		 * Replace the current config file's scan with the currently reported errors.
		 * When the current scan is partial, merge the errors with the last scan.
		 */
		for (const [
			lastErrorConfigFile,
			lastErrors,
		] of PHPStanCheckErrorManager._lastErrors) {
			if (lastErrorConfigFile === configFile) {
				errors.notFileSpecificErrors.push(
					...reportedErrors.notFileSpecificErrors
				);
				errors.fileSpecificErrors = {
					...errors.fileSpecificErrors,
					...(isPartial ? lastErrors.fileSpecificErrors : {}),
					...reportedErrors.fileSpecificErrors,
				};
			} else {
				errors.notFileSpecificErrors.push(
					...lastErrors.notFileSpecificErrors
				);
				errors.fileSpecificErrors = {
					...errors.fileSpecificErrors,
					...lastErrors.fileSpecificErrors,
				};
			}
		}

		return errors;
	}

	public async handleResult(
		result: ReturnResult<ReportedErrors>,
		configFile: string,
		isPartial: boolean
	): Promise<void> {
		const errors = this._getErrors(result, configFile, isPartial);

		if (errors === null) {
			return;
		}

		PHPStanCheckErrorManager._lastErrors.set(configFile, errors);
		await this._showErrors(errors);
	}
}

export interface ReportedErrors {
	fileSpecificErrors: Record<
		string,
		{
			message: string;
			lineNumber: number | null;
			ignorable: boolean;
			identifier: string | null;
			tip: string | null;
		}[]
	>;
	notFileSpecificErrors: string[];
}
