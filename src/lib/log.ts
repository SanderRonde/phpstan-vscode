import { OutputChannel, window } from 'vscode';

let channel: OutputChannel | null;

export function createOutputChannel(): void {
	channel = window.createOutputChannel('PHPStan');
}

export function log(...data: string[]): void {
	if (channel) {
		channel.appendLine(data.join(' '));
	}
}
