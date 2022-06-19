import type { OperationStatus } from './statusBar';

export enum NotificationChannel {
	LOG = 'phpstan.log',
	STATUS_BAR = 'phpstan.statusBar',
	WATCHER = 'phpstan.watcher',
	COMMAND = 'phpstan.command',
}

export interface WatcherNotificationType {
	operation: 'watch';
	uri: string;
	dirty: boolean;
}

export interface CommandNotificationType {
	commandName: string;
	commandArgs: string[];
}

export interface LogNotificationType {
	data: string[];
}

export interface StatusBarNotificationType {
	opId: number;
	result?: OperationStatus;
}
