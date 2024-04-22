import type {
	StatusBarProgress,
	WatcherNotificationFileData,
} from '../../../../shared/notificationChannels';
import { OperationStatus } from '../../../../shared/statusBar';
import { ConfigurationManager } from '../checkConfigManager';
import { errorNotification } from '../notificationChannels';
import type { PHPStanCheckResult } from './processRunner';
import type { CheckConfig } from '../checkConfigManager';
import type { Disposable } from 'vscode-languageserver';
import { PHPStanRunner } from './processRunner';
import type { ClassConfig } from '../types';
import { ReturnResult } from '../result';
import { URI } from 'vscode-uri';
import * as os from 'os';

export type ProgressListener = (progress: StatusBarProgress) => void;

const IN_CONTEXT_OF_PREFIX = ' (in context of';
export class PHPStanCheck implements Disposable {
	private static _lastCheckId: number = 1;
	private _disposables: Disposable[] = [];
	private _done: boolean = false;
	private _disposed: boolean = false;
	private _progressListeners: ProgressListener[] = [];
	private _id: number = PHPStanCheck._lastCheckId++;

	public get id(): number {
		return this._id;
	}

	public get done(): boolean {
		return this._done;
	}

	public constructor(private readonly _classConfig: ClassConfig) {}

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
		file: WatcherNotificationFileData
	): Promise<ReturnResult<ReportedErrors>> {
		// Get file
		const filePath = await ConfigurationManager.applyPathMapping(
			this._classConfig,
			URI.parse(file.uri).fsPath
		);

		const result = await runner.runProcess(
			{
				...checkConfig,
				args: [...checkConfig.args, this._escapeFilePath(filePath)],
			},
			check
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
					URI.from({
						scheme: 'file',
						path: pathMapper(filePath, true),
					}).toString()
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
		onProgress: ProgressListener
	): Promise<ReturnResult<ReportedErrors>> {
		const result = await runner.runProcess(checkConfig, check, {
			onProgress,
		});

		return result.chain((output) => {
			const parsed = this._parseOutput(output);

			// Turn raw fs paths into URIs
			const normalized: ReportedErrors = {
				fileSpecificErrors: {},
				notFileSpecificErrors: parsed.notFileSpecificErrors,
			};
			for (const filePath in parsed.fileSpecificErrors) {
				normalized.fileSpecificErrors[
					URI.from({
						scheme: 'file',
						path: pathMapper(filePath, true),
					}).toString()
				] = parsed.fileSpecificErrors[filePath];
			}
			return normalized;
		});
	}

	public async check(
		applyErrors: boolean,
		file?: WatcherNotificationFileData
	): Promise<ReturnResult<ReportedErrors>> {
		// Get config
		const checkConfig = await ConfigurationManager.collectConfiguration(
			this._classConfig
		);
		if (!checkConfig) {
			return ReturnResult.error();
		}

		const errorManager = new PHPStanCheckErrorManager(this._classConfig);
		const pathMapper = await ConfigurationManager.getPathMapper(
			this._classConfig
		);
		const runner = new PHPStanRunner(this._classConfig);
		this._disposables.push(runner);

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
					file
				);
			} else {
				return this._checkProject(
					this,
					runner,
					checkConfig,
					pathMapper,
					this._onProgress.bind(this)
				);
			}
		})();
		if (applyErrors) {
			await errorManager.handleResult(result, !!file);
		}

		this.dispose();
		this._done = true;

		return result;
	}

	public onProgress(callback: (progress: StatusBarProgress) => void): void {
		this._progressListeners.push(callback);
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._progressListeners = [];
		this._disposables = [];
		this._disposed = true;
	}
}

class PHPStanCheckErrorManager {
	private static _lastErrors: ReportedErrors = {
		fileSpecificErrors: {},
		notFileSpecificErrors: [],
	};

	public constructor(
		private readonly _config: Pick<ClassConfig, 'connection'>
	) {}

	private async _showErrors(errors: ReportedErrors): Promise<void> {
		await this._config.connection.sendNotification(errorNotification, {
			diagnostics: errors,
		});
	}

	private _applyPartialErrors(result: ReportedErrors): ReportedErrors {
		return {
			fileSpecificErrors: {
				...PHPStanCheckErrorManager._lastErrors.fileSpecificErrors,
				...result.fileSpecificErrors,
			},
			notFileSpecificErrors: result.notFileSpecificErrors,
		};
	}

	public async handleResult(
		result: ReturnResult<ReportedErrors>,
		isPartial: boolean
	): Promise<void> {
		const errors = (() => {
			if (result.status === OperationStatus.ERROR) {
				return {
					fileSpecificErrors: {},
					notFileSpecificErrors: [],
				};
			} else if (result.success()) {
				return isPartial
					? this._applyPartialErrors(result.value)
					: result.value;
			}
			return null;
		})();

		if (errors === null) {
			return;
		}

		PHPStanCheckErrorManager._lastErrors = errors;
		await this._showErrors(errors);
	}
}

export interface ReportedErrors {
	fileSpecificErrors: Record<
		string,
		{
			message: string;
			lineNumber: number | null;
		}[]
	>;
	notFileSpecificErrors: string[];
}
