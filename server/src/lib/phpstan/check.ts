import type {
	PHPStanError,
	StatusBarProgress,
} from '../../../../shared/notificationChannels';
import { OperationStatus } from '../../../../shared/statusBar';
import { errorNotification } from '../notificationChannels';
import type { Disposable } from 'vscode-languageserver';
import type { PartialDocument } from './runner';
import type { ClassConfig } from './manager';
import { getConfiguration } from '../config';
import { PHPStanRunner } from './runner';
import { ReturnResult } from './result';

export type ProgressListener = (progress: StatusBarProgress) => void;

export class PHPStanCheck implements Disposable {
	private _disposables: Disposable[] = [];
	private _done: boolean = false;
	private _disposed: boolean = false;
	private _progressListeners: ProgressListener[] = [];
	private _lastResult: ReturnResult<Record<string, PHPStanError[]>> =
		ReturnResult.success({});

	public get done(): boolean {
		return this._done;
	}

	public constructor(private readonly _config: ClassConfig) {}

	private _onProgress(progress: StatusBarProgress): void {
		this._progressListeners.forEach((c) => c(progress));
	}

	public async check(
		applyErrors: boolean,
		e?: PartialDocument
	): Promise<ReturnResult<Record<string, PHPStanError[]>>> {
		if (this._disposed) {
			return ReturnResult.canceled();
		}
		const runner = new PHPStanRunner(this._config);
		const errorManager = new PHPStanCheckErrorManager(this._config);
		this._disposables.push(runner);

		const useProgress = (
			await getConfiguration(
				this._config.connection,
				this._config.getWorkspaceFolder
			)
		).showProgress;
		const result = await (async () => {
			if (!e) {
				return await runner.checkProject(this._onProgress.bind(this));
			}
			const progressArg = useProgress
				? this._onProgress.bind(this)
				: undefined;
			return await runner.check(e, progressArg);
		})();
		this._lastResult = result;
		if (applyErrors) {
			await errorManager.handleResult(result, !e, e?.uri);
		}

		this.dispose();
		this._done = true;

		return result;
	}

	public reApplyErrors(uri: string): Promise<void> {
		return new PHPStanCheckErrorManager(this._config).handleResult(
			this._lastResult,
			false,
			uri
		);
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
	public constructor(private readonly _config: ClassConfig) {}

	private async _showErrors(
		errors: Record<string, PHPStanError[]>,
		isProjectCheck: boolean
	): Promise<void> {
		await this._config.connection.sendNotification(errorNotification, {
			diagnostics: errors,
			isProjectCheck,
		});
	}

	private async _clearErrors(
		isProjectCheck: boolean,
		uri?: string
	): Promise<void> {
		const jsonErrors: Record<string, PHPStanError[]> = {};
		if (uri) {
			jsonErrors[uri] = [];
		}
		await this._config.connection.sendNotification(errorNotification, {
			diagnostics: jsonErrors,
			isProjectCheck,
		});
	}

	public async handleResult(
		result: ReturnResult<Record<string, PHPStanError[]>>,
		isProjectCheck: boolean,
		uri?: string
	): Promise<void> {
		if (result.success()) {
			await this._showErrors(result.value, isProjectCheck);
		} else if (result.status === OperationStatus.ERROR) {
			await this._clearErrors(isProjectCheck, uri);
		}
	}
}
