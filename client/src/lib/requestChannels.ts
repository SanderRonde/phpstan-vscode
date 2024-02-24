import type { InitRequestType } from '../../../shared/requestChannels';
import { RequestChannel } from '../../../shared/requestChannels';
import { RequestType } from 'vscode-languageclient';

export const initRequest = new RequestType<
	InitRequestType['request'],
	InitRequestType['response'],
	InitRequestType['error']
>(RequestChannel.INIT);
