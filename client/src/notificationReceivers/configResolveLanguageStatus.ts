import {
	languages,
	type Disposable,
	window,
	CancellationTokenSource,
} from 'vscode';
import { configResolveRequest, findFilesRequest } from '../lib/requestChannels';
import type { FindFilesRequestType } from '../../../shared/requestChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import { Commands } from '../../../shared/commands/defs';
import { findFiles } from '../lib/files';
import type { Command } from 'vscode';
import { Uri } from 'vscode';
import path from 'path';

export class ConfigResolveLanguageStatus implements Disposable {
	private _disposables: Disposable[] = [];
	private _languageStatus = languages.createLanguageStatusItem(
		'phpstan.languageStatusItem',
		[{ language: 'php' }, { pattern: '**/*.neon' }]
	);
	private _outstandingTokens = new Set<CancellationTokenSource>();

	public constructor(private readonly _client: LanguageClient) {
		this._languageStatus.name = 'PHPStan';
		this._disposables.push(this._languageStatus);

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

		if (window.activeTextEditor) {
			void this._update(window.activeTextEditor.document.uri);
		}
	}

	private _setStatus(config: {
		text: string;
		command: Command | undefined;
		busy: boolean;
	}): void {
		this._languageStatus.text = config.text;
		this._languageStatus.command = config.command;
		this._languageStatus.busy = config.busy ?? false;
	}

	private async _update(uri: Uri): Promise<void> {
		const cancelToken = new CancellationTokenSource();
		this._outstandingTokens.add(cancelToken);

		this._setStatus({
			text: 'PHPStan resolving config...',
			command: undefined,
			busy: true,
		});
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
