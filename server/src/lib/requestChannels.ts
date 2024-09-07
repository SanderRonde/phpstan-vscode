import type {
	InitRequestType,
	TestRunRequestType,
} from '../../../shared/requestChannels';
import { RequestChannel } from '../../../shared/requestChannels';
import { RequestType } from 'vscode-languageserver';

export const initRequest = new RequestType<
	InitRequestType['request'],
	InitRequestType['response'],
	InitRequestType['error']
>(RequestChannel.INIT);

export const testRunRequest = new RequestType<
	TestRunRequestType['request'],
	TestRunRequestType['response'],
	TestRunRequestType['error']
>(RequestChannel.TEST_RUN);
