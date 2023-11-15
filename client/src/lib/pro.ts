import type { LanguageClient } from 'vscode-languageclient/node';
import { phpstanProNotification } from './notificationChannels';
import type { Disposable } from 'vscode';
import { env, window } from 'vscode';
import { Uri } from 'vscode';

export class PHPStanProManager implements Disposable {
	private _disposables: Disposable[] = [];
	public port: number | null = null;

	public constructor(client: LanguageClient) {
		this._disposables.push(
			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			client.onNotification(phpstanProNotification, async (message) => {
				if (message.type === 'setPort') {
					this.port = message.port;
				} else if (message.type === 'requireLogin') {
					const choice = await window.showInformationMessage(
						'Please log in to PHPStan Pro',
						'Log in'
					);
					if (choice === 'Log in') {
						if (!this.port) {
							void window.showErrorMessage(
								'PHPStan Pro port is unknown'
							);
						} else {
							void env.openExternal(
								Uri.parse(`http://127.0.0.1:${this.port}`)
							);
						}
					}
				}
			})
		);
	}

	public dispose(): void {
		for (const disposable of this._disposables) {
			disposable.dispose();
		}
	}
}
