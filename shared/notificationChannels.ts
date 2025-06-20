import type { ReportedErrors } from '../server/src/lib/phpstan/check';
import type { OperationStatus } from './statusBar';
import type { Commands } from './commands/defs';

export enum NotificationChannel {
	STATUS_BAR = 'phpstan.statusBar',
	WATCHER = 'phpstan.watcher',
	COMMAND = 'phpstan.command',
	ERROR = 'phpstan.error',
	SPAWNER = 'phpstan.spawner',
	DEBUG = 'phpstan.debug',
	PHPSTAN_PRO = 'phpstan.phpstanPro',
	TEST = 'phpstan.test',
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
			file: WatcherNotificationFileData | null;
	  }
	| {
			operation: 'checkAllProjects';
	  }
	| {
			operation: 'onConfigChange';
			file: WatcherNotificationFileData | null;
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

export type StatusBarNotificationType =
	| {
			opId: number;
			type: 'new';
			tooltip: string;
	  }
	| {
			opId: number;
			progress: StatusBarProgress;
			type: 'progress';
			tooltip: string;
	  }
	| {
			opId: number;
			type: 'done';
			result: OperationStatus;
	  }
	| {
			type: 'fallback';
			text: string | undefined;
			command?: Commands;
	  };

export interface ProcessNotificationType {
	pid: number;
	timeout: number;
	children?: number[];
}

export type PHPStanProNotificationType =
	| {
			type: 'setPort';
			port: number;
	  }
	| {
			type: 'requireLogin';
	  };

export interface ErrorNotificationType {
	diagnostics: ReportedErrors;
}

export interface DebugNotificationType {
	debugData: { type: string; data: unknown[] };
}
