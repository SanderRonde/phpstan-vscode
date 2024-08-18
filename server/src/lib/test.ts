import type { Disposable, _Connection } from 'vscode-languageserver';
import { PHPStanCheckManager } from './phpstan/checkManager';
import { OperationStatus } from '../../../shared/statusBar';
import { assertUnreachable } from '../../../shared/util';
import type { DocumentManager } from './documentManager';
import { testRunRequest } from './requestChannels';
import { getVersion } from '../start/getVersion';
import type { ClassConfig } from './types';

export function listenTest(
	connection: _Connection,
	classConfig: ClassConfig,
	documentManager: DocumentManager,
	checkManager: PHPStanCheckManager | undefined
): Disposable {
	return connection.onRequest(
		testRunRequest,
		async (
			params
		): Promise<NonNullable<(typeof testRunRequest)['_']>[1]> => {
			classConfig.editorConfigOverride.set(params);
			try {
				if (params.dryRun) {
					return await getVersion(classConfig);
				} else {
					checkManager ??= new PHPStanCheckManager(
						classConfig,
						() => documentManager
					);
					let error: string | undefined = undefined;
					const status = await checkManager.check(
						params.file,
						'test',
						(_error) => {
							error = _error;
						}
					);
					if (status === OperationStatus.SUCCESS) {
						return { success: true };
					} else if (status === OperationStatus.CANCELLED) {
						return {
							success: false,
							error: 'Operation was cancelled, try again',
						};
					} else if (status === OperationStatus.KILLED) {
						return {
							success: false,
							error: 'Operation was killed, try again',
						};
					} else if (status === OperationStatus.ERROR) {
						return {
							success: false,
							error: error ?? 'Unknown error',
						};
					} else {
						assertUnreachable(status);
					}
				}
			} finally {
				classConfig.editorConfigOverride.set({});
			}
		}
	);
}
