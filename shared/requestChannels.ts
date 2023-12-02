export enum RequestChannel {
	INIT = 'phpstan.init',
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
