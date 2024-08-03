import { OperationStatus } from '../../../../../shared/statusBar';
import { ConfigurationManager } from '../../checkConfigManager';
import { errorNotification } from '../../notificationChannels';
import type { StatusBarOperation } from '../../statusBar';
import type { Disposable } from 'vscode-languageserver';
import type { ClassConfig } from '../../types';
import type { ReportedErrors } from '../check';
import { log, PRO_PREFIX } from '../../log';
import { URI } from 'vscode-uri';
import * as http from 'http';
import * as ws from 'ws';

export class PHPStanProErrorManager implements Disposable {
	private _wsClient: ws.WebSocket | null = null;
	private readonly _pathMapper: Promise<
		(filePath: string, inverse?: boolean) => string
	>;

	public constructor(
		private readonly _classConfig: ClassConfig,
		private readonly _port: number
	) {
		this._pathMapper = ConfigurationManager.getPathMapper(_classConfig);
		this._connect();
	}

	private async _progressUpdate(
		operation: StatusBarOperation | null,
		progress: ProProgress,
		onDone: () => Promise<void>
	): Promise<void> {
		if (!progress.inProgress) {
			return onDone();
		}

		if (operation) {
			const progressPercentage = Math.round(
				(progress.done / progress.total) * 100
			);
			await operation.progress(
				{
					done: progress.done,
					total: progress.total,
					percentage: progressPercentage,
				},
				`PHPStan checking project - ${progress.done}/${progress.total} (${progressPercentage}%)`
			);
		}
	}

	private _activeRequest:
		| {
				state: 'pending';
				queueNextRequest: boolean;
		  }
		| {
				state: 'none';
		  } = { state: 'none' };
	private async _queueProgressUpdate(
		operation: StatusBarOperation | null,
		onDone: () => Promise<void>
	): Promise<void> {
		if (this._activeRequest.state === 'pending') {
			this._activeRequest.queueNextRequest = true;
			return;
		}
		this._activeRequest = {
			state: 'pending',
			queueNextRequest: false,
		};
		const progress = await this._collectProgress();
		if (progress) {
			await this._progressUpdate(operation, progress, onDone);
		}

		const nextRequest = this._activeRequest.queueNextRequest;
		this._activeRequest = {
			state: 'none',
		};
		if (nextRequest) {
			void this._queueProgressUpdate(operation, onDone);
		}
	}

	private _connect(): void {
		const url = `ws://127.0.0.1:${this._port}/websocket`;
		this._wsClient = new ws.WebSocket(url);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this._wsClient.on('error', async () => {
			const choice =
				await this._classConfig.connection.window.showErrorMessage(
					`PHPStan Pro failed to make websocket connection to: ${url}`,
					{
						title: 'Retry',
					}
				);
			if (choice?.title === 'Retry') {
				this._connect();
			}
		});
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this._wsClient.on('close', async () => {
			const choice =
				await this._classConfig.connection.window.showErrorMessage(
					`PHPStan Pro disconnected from websocket URL: ${url}`,
					{
						title: 'Retry',
					}
				);
			if (choice?.title === 'Retry') {
				this._connect();
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this._wsClient.on('open', async () => {
			await this._classConfig.hooks.provider.onCheckDone();

			void this._applyErrors();
		});

		let checkOperation: StatusBarOperation | null = null;
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this._wsClient.on('message', async (data: Buffer) => {
			const msg = JSON.parse(data.toString()) as WSMessage;
			// ProgressUpdate requests are very spammy, let's not log every time
			if (msg.action !== 'progressUpdate') {
				void log(
					this._classConfig.connection,
					PRO_PREFIX,
					`Received message of type: ${msg.action}`
				);
			}

			const onAnalysisDone = async (): Promise<void> => {
				if (checkOperation) {
					await this._classConfig.hooks.provider.onCheckDone();
					await checkOperation.finish(OperationStatus.SUCCESS);
					checkOperation = null;
				}
				await this._applyErrors();
			};
			if (
				msg.action === 'analysisStart' ||
				msg.action === 'changedFile'
			) {
				if (checkOperation) {
					// Check already exists, finish that one
					await onAnalysisDone();
				}

				checkOperation = this._classConfig.statusBar.createOperation();
				await Promise.all([
					checkOperation.start('PHPStan Pro Checking...'),
					this._classConfig.connection.sendNotification(
						errorNotification,
						{
							diagnostics: {
								fileSpecificErrors: {},
								notFileSpecificErrors: [],
							},
						}
					),
				]);
			} else if (msg.action === 'analysisEnd') {
				await onAnalysisDone();
			} else if (msg.action === 'progressUpdate') {
				await this._queueProgressUpdate(checkOperation, onAnalysisDone);
			}
		});
	}

	private _collectProgress(): Promise<ProProgress | null> {
		return this._collectData<ProProgress>('progress');
	}

	private _collectErrors(): Promise<ProReportedErrors | null> {
		return this._collectData<ProReportedErrors>('errors');
	}

	private _collectData<T>(path: string): Promise<T | null> {
		return new Promise<T | null>((resolve) => {
			const req = http.request(`http://127.0.0.1:${this._port}/${path}`);
			req.on('response', (res) => {
				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					const errors = JSON.parse(data) as T;
					resolve(errors);
				});
			});
			req.end();
		});
	}

	private async _applyErrors(): Promise<void> {
		const errors = await this._collectErrors();
		await log(
			this._classConfig.connection,
			PRO_PREFIX,
			`Found errors: ${JSON.stringify(errors)}`
		);
		if (!errors) {
			// Already cleared, don't apply anything
			return;
		}

		const pathMapper = await this._pathMapper;
		const fileSpecificErrors: ReportedErrors['fileSpecificErrors'] = {};
		for (const fileError of errors.fileSpecificErrors) {
			const uri = URI.from({
				scheme: 'file',
				path: pathMapper(fileError.file, true),
			}).toString();
			fileSpecificErrors[uri] ??= [];
			fileSpecificErrors[uri].push({
				message: fileError.message,
				lineNumber: fileError.line,
				ignorable: fileError.ignorable,
				identifier: fileError.identifier ?? null,
			});
		}
		void this._classConfig.connection.sendNotification(errorNotification, {
			diagnostics: {
				fileSpecificErrors: fileSpecificErrors,
				notFileSpecificErrors: errors.notFileSpecificErrors,
			},
		});
	}

	public dispose(): void {
		this._wsClient?.close();
	}
}

interface ReportedError {
	contextLines: {
		lines: string[];
		startLine: number;
	};
	// Not sure what the type here is but we don't need it
	definiteFixerSuggestion: unknown | null;
	file: string;
	id: string;
	line: number | null;
	message: string;
	ignorable: boolean;
	identifier: string | null;
}

interface ProReportedErrors {
	fileSpecificErrors: ReportedError[];
	notFileSpecificErrors: string[];
}

interface ProProgress {
	done: number;
	total: number;
	inProgress: boolean;
}

type WSMessage =
	| {
			action: 'progressUpdate';
			data: { id: string };
	  }
	| {
			action: 'analysisStart' | 'changedFile';
	  }
	| {
			action: 'analysisEnd';
			data: {
				filesCount: number;
			};
	  };
