import type { OperationStatus } from './statusBar';

export enum NotificationChannel {
	LOG = 'phpstan.log',
	STATUS_BAR = 'phpstan.statusBar',
	WATCHER = 'phpstan.watcher',
	COMMAND = 'phpstan.command',
	READY = 'phpstan.ready',
	ERROR = 'phpstan.error',
}

export interface WatcherNotificationFileData {
	uri: string;
	content: string;
	languageId: string;
}

export type WatcherNotificationType =
	| {
			operation: 'open';
			file: WatcherNotificationFileData;
			check: boolean;
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
			operation: 'checkProject';
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

export interface StatusBarProgress {
	percentage: number;
	total: number;
	done: number;
}

export interface StatusBarNotificationType {
	opId: number;
	progress?: StatusBarProgress;
	result?: OperationStatus;
}

export interface ReadyNotificationType {
	ready: boolean;
}

export interface PHPStanError {
	message: string;
	lineNumber: number;
	file: string;
}

export interface ErrorNotificationType {
	diagnostics: Record<string, PHPStanError[]>;
	isProjectCheck: boolean;
}
