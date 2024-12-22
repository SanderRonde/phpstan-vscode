import type { LanguageClient } from 'vscode-languageclient/node';

import { debugNotification } from '../lib/notificationChannels';
import type { Disposable } from 'vscode';

const sessionDebugData: {
	type: string;
	data: unknown[];
	timestamp: string;
	timestampMs: number;
}[] = [];

export function debug(type: string, ...data: unknown[]): void {
	const now = new Date();
	sessionDebugData.push({
		type,
		data,
		timestamp: now.toISOString(),
		timestampMs: now.getTime(),
	});
}

export function initDebugReceiver(client: LanguageClient): Disposable {
	return client.onNotification(debugNotification, (params) => {
		debug(params.debugData.type, ...params.debugData.data);
	});
}

export function getDebugData(): {
	type: string;
	data: unknown[];
	timestamp: string;
	timestampMs: number;
}[] {
	return sessionDebugData;
}

export * from '../../../shared/debug';
