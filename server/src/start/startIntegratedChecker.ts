import type {
	ClassConfig,
	WorkspaceFolders,
	PromisedValue,
} from '../lib/types';
import type { _Connection, Disposable } from 'vscode-languageserver';
import { PHPStanCheckManager } from '../lib/phpstan/checkManager';
import { createHoverProvider } from '../providers/hoverProvider';
import type { ProviderArgs } from '../providers/providerUtil';
import { getEditorConfiguration } from '../lib/editorConfig';
import { DocumentManager } from '../lib/documentManager';
import { ResolvedPromisedValue } from '../lib/types';
import type { StartResult } from '../server';
import { wait } from '../../../shared/util';
import { Watcher } from '../lib/watcher';

export function startIntegratedChecker(
	classConfig: ClassConfig,
	connection: _Connection,
	disposables: Disposable[],
	onConnectionInitialized: Promise<void>,
	workspaceFolders: PromisedValue<WorkspaceFolders | null>,
	startedAt: PromisedValue<Date>
): StartResult {
	const checkManager: PHPStanCheckManager = new PHPStanCheckManager(
		classConfig,
		() => documentManager
	);
	const documentManager = new DocumentManager(classConfig, {
		phpstan: checkManager,
		onConnectionInitialized,
		watcher: new Watcher(classConfig, checkManager),
	});
	disposables.push(checkManager, documentManager);

	const providerArgs: ProviderArgs = {
		connection,
		hooks: classConfig.hooks.provider,
		phpstan: checkManager,
		workspaceFolders,
		onConnectionInitialized,
		documents: documentManager,
	};

	void (async () => {
		const startedAtTime = await startedAt.get();
		const serverLiveFor = Date.now() - startedAtTime.getTime();
		// Wait a while after start with checking so as to now tax the system too much
		await wait(Math.max(5000 - serverLiveFor, 0));
		const configuration = await getEditorConfiguration({
			connection,
			workspaceFolders,
			editorConfigOverride: new ResolvedPromisedValue({}),
		});
		if (
			configuration.enabled &&
			!configuration.singleFileMode &&
			checkManager.operationCount === 0
		) {
			void checkManager.checkWithDebounce(
				undefined,
				'Initial check',
				null
			);
		}
	})();

	return {
		hoverProvider: createHoverProvider(providerArgs),
		checkManager,
		documentManager,
	};
}
