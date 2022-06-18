import { NotificationChannel } from '../../../shared/notificationChannels';
import type { LanguageClient } from 'vscode-languageclient/node';
import type { ExtensionContext, OutputChannel } from 'vscode';
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
		client.onNotification(NotificationChannel.LOG, (args: string[]) => {
			log(...args);
		})
	);
}

export function log(...data: string[]): void {
	if (channel) {
		channel.appendLine(data.join(' '));
	}
}
