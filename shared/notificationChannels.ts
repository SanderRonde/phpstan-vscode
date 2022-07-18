import type { OperationStatus } from './statusBar';

export enum NotificationChannel {
	LOG = 'phpstan.log',
	STATUS_BAR = 'phpstan.statusBar',
	WATCHER = 'phpstan.watcher',
	COMMAND = 'phpstan.command',
	READY = 'phpstan.ready',
}

export interface WatcherNotificationFileData {
	uri: string;
	dirty: boolean;
	content: string;
}

export type WatcherNotificationType =
	| {
			operation: 'open';
			file: WatcherNotificationFileData;
	  }
	| {
			operation: 'change';
			file: WatcherNotificationFileData;
	  }
	| {
			operation: 'save';
			file: WatcherNotificationFileData;
	  }
	| {
			operation: 'setActive';
			file: WatcherNotificationFileData;
	  }
	| {
			operation: 'close';
			file: WatcherNotificationFileData;
	  }
	| {
			operation: 'check';
			file: WatcherNotificationFileData;
	  }
	| {
			operation: 'clear';
	  };

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

export interface ReadyNotificationType {
	ready: boolean;
}
