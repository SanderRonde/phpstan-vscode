import type { WatcherNotificationFileData } from './notificationChannels';
import type { ConfigSettings, ConfigWithoutPrefix } from './config';

export enum RequestChannel {
	INIT = 'phpstan.init',
	TEST_RUN = 'phpstan.testRun',
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
	request: Partial<ConfigWithoutPrefix<ConfigSettings>> & {
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
