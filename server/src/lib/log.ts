import { logNotification } from './notificationChannels';
import type { _Connection } from 'vscode-languageserver';
import type { PHPStanCheck } from './phpstan/check';

export async function log(
	connection: _Connection,
	prefix: Prefix,
	...data: (string | number)[]
): Promise<void> {
	data = [prefix, ...data];
	console.log(data.join(' '));
	await connection.sendNotification(logNotification, {
		data: data.map((d) => String(d)),
	});
}

type Prefix = string & {
	__isPrefix: true;
};

export function checkPrefix(check: PHPStanCheck): Prefix {
	return `[check:${check.id}]` as Prefix;
}

export const MANAGER_PREFIX = '[file-manager]' as Prefix;
export const WATCHER_PREFIX = '[file-watcher]' as Prefix;
export const ERROR_PREFIX = '[error]' as Prefix;
export const HOVER_PROVIDER_PREFIX = '[hover-provider]' as Prefix;
export const SERVER_PREFIX = '[server]' as Prefix;
