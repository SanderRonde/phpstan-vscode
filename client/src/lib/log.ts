import type { ExtensionContext, OutputChannel } from 'vscode';
import { ExtensionMode, window } from 'vscode';

let channel: OutputChannel | null;

export function createOutputChannel(): OutputChannel {
	channel = window.createOutputChannel('PHPStan');
	return channel;
}

type Prefix = string & {
	__isPrefix: true;
};

export function log(
	context: ExtensionContext,
	prefix: Prefix,
	...data: string[]
): void {
	data = [`[${new Date().toLocaleString()}]`, prefix, ...data];
	if (context.extensionMode === ExtensionMode.Development) {
		console.log(data.join(' '));
	}
	if (channel) {
		channel.appendLine(data.join(' '));
	}
}

export const STATUS_BAR_PREFIX = '[status-bar]' as Prefix;
export const CLIENT_PREFIX = '[client]' as Prefix;
export const SERVER_PREFIX = '[server]' as Prefix;
export const PROCESS_SPAWNER_PREFIX = '[process-spawner]' as Prefix;
