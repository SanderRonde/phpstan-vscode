import type { LanguageClient } from 'vscode-languageclient/node';
import type { ExtensionContext, OutputChannel } from 'vscode';
import { logNotification } from './notificationChannels';
import { window } from 'vscode';

let channel: OutputChannel | null;

export function createOutputChannel(): void {
	channel = window.createOutputChannel('PHPStan');
}

export function registerLogMessager(
	context: ExtensionContext,
	client: LanguageClient
): void {
	context.subscriptions.push(
		client.onNotification(logNotification, ({ data }) => {
			log(...data);
		})
	);
}

export function log(...data: string[]): void {
	console.log(data.join(' '));
	if (channel) {
		channel.appendLine(data.join(' '));
	}
}
