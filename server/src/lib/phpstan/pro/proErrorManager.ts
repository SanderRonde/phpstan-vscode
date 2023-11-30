import { OperationStatus } from '../../../../../shared/statusBar';
import { errorNotification } from '../../notificationChannels';
import type { StatusBarOperation } from '../../statusBar';
import type { Disposable } from 'vscode-languageserver';
import { ConfigurationManager } from '../configManager';
import type { ReportedErrors } from '../outputParser';
import type { ClassConfig } from '../manager';
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

		this._wsClient.on('open', () => {
			void this._applyErrors();
		});

		let checkOperation: StatusBarOperation | null = null;
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		this._wsClient.on('message', async (data: Buffer) => {
			const msg = JSON.parse(data.toString()) as WSMessage;
			void log(
				this._classConfig.connection,
				PRO_PREFIX,
				`Received message of type: ${msg.action}`
			);
			if (msg.action === 'analysisStart') {
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
				await this._classConfig.hooks.provider.onCheckDone();

				await checkOperation?.finish(OperationStatus.SUCCESS);
				await this._applyErrors();
			}
		});
	}

	private _collectErrors(): Promise<ProReportedErrors | null> {
		return new Promise<ProReportedErrors | null>((resolve) => {
			const req = http.request(`http://127.0.0.1:${this._port}/errors`);
			req.on('response', (res) => {
				let data = '';
				res.on('data', (chunk) => {
					data += chunk;
				});
				res.on('end', () => {
					const errors = JSON.parse(data) as ProReportedErrors;
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
	line: number;
	message: string;
}

interface ProReportedErrors {
	fileSpecificErrors: ReportedError[];
	notFileSpecificErrors: string[];
}

type WSMessage =
	| {
			action: 'analysisStart';
	  }
	| {
			action: 'analysisEnd';
			data: {
				filesCount: number;
			};
	  };
