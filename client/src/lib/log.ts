import type { LanguageClient } from 'vscode-languageclient/node';
import type { ExtensionContext, OutputChannel } from 'vscode';
import { logNotification } from './notificationChannels';
import { window } from 'vscode';
import { DEBUG } from './dev';

let channel: OutputChannel | null;

export function createOutputChannel(): void {
	channel = window.createOutputChannel('PHPStan Client');
}

export function registerLogMessager(
	context: ExtensionContext,
	client: LanguageClient
): void {
	context.subscriptions.push(
		client.onNotification(logNotification, ({ data }) => {
			log(...(data as [Prefix, ...string[]]));
		})
	);
}

type Prefix = string & {
	__isPrefix: true;
};

export function log(prefix: Prefix, ...data: string[]): void {
	data = [prefix, ...data];
	if (DEBUG) {
		console.log(data.join(' '));
	}
	if (channel) {
		channel.appendLine(data.join(' '));
	}
}

export const STATUS_BAR_PREFIX = '[status-bar]' as Prefix;
export const CLIENT_PREFIX = '[client]' as Prefix;
export const SERVER_PREFIX = '[server]' as Prefix;
export const ERROR_PREFIX = '[error]' as Prefix;
