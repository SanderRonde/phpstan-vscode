import {
	languages,
	type Disposable,
	window,
	CancellationTokenSource,
	type ExtensionContext,
	LanguageStatusSeverity,
} from 'vscode';
import { configResolveRequest, findFilesRequest } from '../lib/requestChannels';
import type { FindFilesRequestType } from '../../../shared/requestChannels';
import { configErrorNotification } from '../lib/notificationChannels';
import type { PromisedValue } from '../../../server/src/lib/types';
import type { LanguageClient } from 'vscode-languageclient/node';
import { Commands } from '../../../shared/commands/defs';
import { findFiles } from '../lib/files';
import type { Command } from 'vscode';
import * as crypto from 'crypto';
import { Uri } from 'vscode';
import path from 'path';

export class ConfigResolveLanguageStatus implements Disposable {
	private _disposables: Disposable[] = [];
	private _languageStatus = languages.createLanguageStatusItem(
		'phpstan.languageStatusItem',
		[{ language: 'php' }, { pattern: '**/*.neon' }]
	);
	private _outstandingTokens = new Set<CancellationTokenSource>();
	private _currentError: {
		message: string;
		type: 'config' | 'binary' | 'cwd' | 'other';
	} | null = null;
	private _dismissedErrors: Set<string> = new Set();

	public constructor(
		private readonly _context: ExtensionContext,
		private readonly _client: LanguageClient,
		private readonly _languageServerReady: PromisedValue<boolean>
	) {
		this._languageStatus.name = 'PHPStan';
		this._disposables.push(this._languageStatus);
		this._loadDismissedErrors();

		this._disposables.push(
			_client.onRequest(
				findFilesRequest,
				async (params): Promise<FindFilesRequestType['response']> => {
					return {
						files: (await findFiles(params.pattern)).map((file) =>
							file.toString()
						),
					};
				}
			)
		);
		this._disposables.push(
			window.onDidChangeActiveTextEditor((editor) => {
				this._outstandingTokens.forEach((token) => token.cancel());
				this._outstandingTokens.clear();

				if (!editor) {
					// Should not be visible
					this._setStatus({
						text: 'PHPStan resolving config...',
						command: undefined,
						busy: true,
					});
					return;
				}
				void this._update(editor.document.uri);
			})
		);

		this._disposables.push(
			_client.onNotification(configErrorNotification, (params) => {
				if (params.error === null) {
					// Clear error
					this._currentError = null;
					if (window.activeTextEditor) {
						void this._update(window.activeTextEditor.document.uri);
					}
				} else {
					const errorHash = this._hashError(params.error);
					if (this._dismissedErrors.has(errorHash)) {
						// Error was dismissed, don't show it
						return;
					}

					this._currentError = {
						message: params.error,
						type: params.errorType,
					};
					this._updateErrorStatus();
				}
			})
		);

		if (window.activeTextEditor) {
			void this._update(window.activeTextEditor.document.uri);
		}
	}

	private _loadDismissedErrors(): void {
		const dismissed = this._context.globalState.get<string[]>(
			'phpstan.dismissedErrors',
			[]
		);
		this._dismissedErrors = new Set(dismissed);
	}

	private async _saveDismissedErrors(): Promise<void> {
		await this._context.globalState.update(
			'phpstan.dismissedErrors',
			Array.from(this._dismissedErrors)
		);
	}

	private _hashError(error: string): string {
		return crypto.createHash('md5').update(error).digest('hex');
	}

	private _updateErrorStatus(): void {
		if (!this._currentError) {
			return;
		}

		const severity =
			this._currentError.type === 'config' ||
			this._currentError.type === 'binary'
				? LanguageStatusSeverity.Error
				: LanguageStatusSeverity.Warning;

		this._languageStatus.severity = severity;
		this._languageStatus.text = `PHPStan (${this._currentError.type} error)`;
		this._languageStatus.detail = this._currentError.message;
		this._languageStatus.busy = false;
		this._languageStatus.command = {
			title: 'Show options',
			command: Commands.SHOW_CONFIG_ERROR_MENU,
			arguments: [],
		};
	}

	public async showConfigErrorMenu(): Promise<void> {
		if (!this._currentError) {
			return;
		}

		const choice = await window.showQuickPick(
			[
				{
					label: 'Launch setup',
					description: 'Open PHPStan setup wizard',
					action: 'setup',
				},
				{
					label: 'Dismiss permanently',
					description:
						'Never show this error again (can be reset in settings)',
					action: 'dismiss',
				},
			],
			{
				placeHolder: `PHPStan ${this._currentError.type} error: ${this._currentError.message}`,
			}
		);

		if (!choice) {
			return;
		}

		if (choice.action === 'setup') {
			await window.showInformationMessage(
				'PHPStan setup wizard is not yet implemented. Please configure PHPStan manually.',
				{ modal: false }
			);
		} else if (choice.action === 'dismiss') {
			await this.dismissCurrentError();
		}
	}

	public async dismissCurrentError(): Promise<void> {
		if (!this._currentError) {
			return;
		}

		const errorHash = this._hashError(this._currentError.message);
		this._dismissedErrors.add(errorHash);
		await this._saveDismissedErrors();

		// Clear the current error display
		this._currentError = null;
		if (window.activeTextEditor) {
			void this._update(window.activeTextEditor.document.uri);
		}
	}

	private _setStatus(config: {
		text: string;
		command: Command | undefined;
		busy: boolean;
	}): void {
		// If there's a current error, don't override it
		if (this._currentError) {
			return;
		}
		this._languageStatus.text = config.text;
		this._languageStatus.command = config.command;
		this._languageStatus.busy = config.busy ?? false;
		this._languageStatus.severity = LanguageStatusSeverity.Information;
		this._languageStatus.detail = undefined;
	}

	private async _update(uri: Uri): Promise<void> {
		const cancelToken = new CancellationTokenSource();
		this._outstandingTokens.add(cancelToken);

		this._setStatus({
			text: 'PHPStan resolving config...',
			command: undefined,
			busy: true,
		});
		await this._languageServerReady.get();
		const result = await this._client.sendRequest(
			configResolveRequest,
			{
				uri: uri.toString(),
			},
			cancelToken.token
		);

		this._languageStatus.busy = false;
		if (result.uri) {
			const configUri = Uri.parse(result.uri);
			this._setStatus({
				text: path.basename(configUri.fsPath),
				busy: false,
				command: {
					title: 'Open config file',
					command: 'vscode.open',
					arguments: [configUri],
				},
			});
		} else {
			this._setStatus({
				text: 'PHPStan (no config found)',
				busy: false,
				command: {
					title: 'Show output channel',
					command: Commands.SHOW_OUTPUT_CHANNEL,
					arguments: [],
				},
			});
		}
	}

	public dispose(): void {
		this._disposables.forEach((disposable) => void disposable.dispose());
	}
}
