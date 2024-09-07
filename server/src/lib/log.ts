import { logNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import type { PHPStanCheck } from './phpstan/check';

export async function log(
	connection: _Connection,
	prefix: LogPrefix,
	...data: (string | number)[]
): Promise<void> {
	data = [prefix, ...data];
	console.log([`[${new Date().toLocaleString()}]`, ...data].join(' '));
	await connection.sendNotification(logNotification, {
		data: data.map((d) => String(d)),
	});
}

export type LogPrefix = string & {
	__isPrefix: true;
};

export function checkPrefix(check: PHPStanCheck): LogPrefix {
	return `[check:${check.id}]` as LogPrefix;
}

export const MANAGER_PREFIX = '[fixer-manager]' as LogPrefix;
export const WATCHER_PREFIX = '[file-watcher]' as LogPrefix;
export const ERROR_PREFIX = '[error]' as LogPrefix;
export const HOVER_PROVIDER_PREFIX = '[hover-provider]' as LogPrefix;
export const SERVER_PREFIX = '[server]' as LogPrefix;
export const PRO_PREFIX = '[pro]' as LogPrefix;
export const DIAGNOSE_GET_FILES = '[diagnose-get-files]' as LogPrefix;
