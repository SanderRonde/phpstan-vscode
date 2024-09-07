import type { StatusBarProgress } from '../../../../shared/notificationChannels';
import { ConfigurationManager } from '../checkConfigManager';
import type { AsyncDisposable, ClassConfig } from '../types';
import { PHPStanRunner } from './processRunner';
import { DIAGNOSE_GET_FILES } from '../log';
import { ReturnResult } from '../result';

export type ProgressListener = (progress: StatusBarProgress) => void;

export class PHPStanDiagnose implements AsyncDisposable {
	private _done: boolean = false;
	private _disposed: boolean = false;
	public disposables: AsyncDisposable[] = [];

	public get done(): boolean {
		return this._done;
	}

	public constructor(private readonly _classConfig: ClassConfig) {}

	public async diagnose(
		onError: null | ((error: string) => void)
	): Promise<ReturnResult<string>> {
		// Get config
		const checkConfig = await ConfigurationManager.collectConfiguration(
			this._classConfig,
			'diagnose',
			onError
		);
		if (!checkConfig) {
			return ReturnResult.error();
		}

		const runner = new PHPStanRunner(this._classConfig);
		this.disposables.push(runner);

		if (this._disposed) {
			return ReturnResult.canceled();
		}

		const result = await runner.runProcess(
			checkConfig,
			DIAGNOSE_GET_FILES,
			false,
			{
				onError,
			}
		);

		await this.dispose();
		this._done = true;

		return result;
	}

	public async dispose(): Promise<void> {
		await Promise.all(this.disposables.map((d) => d.dispose()));
		this.disposables = [];
		this._disposed = true;
	}
}
