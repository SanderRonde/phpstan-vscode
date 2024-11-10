import type { WatcherNotificationFileData } from './notificationChannels';
import type { ConfigSettingsWithoutPrefix } from './config';

export enum RequestChannel {
	INIT = 'phpstan.init',
	TEST_RUN = 'phpstan.testRun',
	CONFIG_RESOLVE = 'phpstan.configResolve',
	FIND_FILES = 'phpstan.findFiles',
}

export interface InitRequestType {
	request: {
		ready: boolean;
	};
	response: {
		extensionPath: string;
		startedAt: number;
	};
	error: never;
}

export interface TestRunRequestType {
	request: Partial<ConfigSettingsWithoutPrefix> & {
		dryRun: boolean;
		file?: WatcherNotificationFileData;
	};
	response:
		| {
				success: true;
		  }
		| {
				success: false;
				error: string;
		  };
	error: never;
}

export interface ConfigResolveRequestType {
	request: {
		uri: string;
	};
	response: {
		uri: string | null;
	};
	error: never;
}

export interface FindFilesRequestType {
	request: {
		pattern: string;
	};
	response: {
		files: string[];
	};
	error: never;
}
