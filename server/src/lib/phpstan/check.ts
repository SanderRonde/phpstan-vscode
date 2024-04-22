import type {
	StatusBarProgress,
	WatcherNotificationFileData,
} from '../../../../shared/notificationChannels';
import { OperationStatus } from '../../../../shared/statusBar';
import { errorNotification } from '../notificationChannels';
import type { Disposable } from 'vscode-languageserver';
import type { ReportedErrors } from './outputParser';
import type { ClassConfig } from './manager';
import { PHPStanRunner } from './runner';
import { ReturnResult } from './result';

export type ProgressListener = (progress: StatusBarProgress) => void;

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

	public constructor(private readonly _config: ClassConfig) {}

	private _onProgress(progress: StatusBarProgress): void {
		this._progressListeners.forEach((c) => c(progress));
	}

	public async check(
		applyErrors: boolean,
		file?: WatcherNotificationFileData
	): Promise<ReturnResult<ReportedErrors>> {
		if (this._disposed) {
			return ReturnResult.canceled();
		}
		const runner = new PHPStanRunner(this._config);
		const errorManager = new PHPStanCheckErrorManager(this._config);
		this._disposables.push(runner);

		const result = await (() => {
			if (file) {
				return runner.checkFile(this, file);
			} else {
				return runner.checkProject(this, this._onProgress.bind(this));
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
