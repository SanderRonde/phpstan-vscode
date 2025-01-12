import type { PHPStanCheck } from './phpstan/check';

export function log(prefix: LogPrefix, ...data: (string | number)[]): void {
	data = [prefix, ...data];
	console.log([`[${new Date().toLocaleString()}]`, ...data].join(' '));
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
