import type {
	_Connection,
	Disposable,
	ServerRequestHandler,
	HoverParams,
	Hover,
} from 'vscode-languageserver';
import type {
	ClassConfig,
	PromisedValue,
	WorkspaceFolders,
} from '../lib/types';
import { PHPStanCheckManager } from '../lib/phpstan/checkManager';
import { createHoverProvider } from '../providers/hoverProvider';
import type { ProviderArgs } from '../providers/providerUtil';
import { getEditorConfiguration } from '../lib/editorConfig';
import { DocumentManager } from '../lib/documentManager';
import { wait } from '../../../shared/util';

export function startIntegratedChecker(
	classConfig: ClassConfig,
	connection: _Connection,
	disposables: Disposable[],
	onConnectionInitialized: Promise<void>,
	workspaceFolders: PromisedValue<WorkspaceFolders | null>,
	startedAt: PromisedValue<Date>
): {
	hoverProvider: ServerRequestHandler<
		HoverParams,
		Hover | undefined | null,
		never,
		void
	> | null;
} {
	const phpstan: PHPStanCheckManager = new PHPStanCheckManager(
		classConfig,
		() => documentManager
	);
	const documentManager = new DocumentManager(classConfig, {
		phpstan,
		onConnectionInitialized,
	});
	disposables.push(phpstan, documentManager);

	const providerArgs: ProviderArgs = {
		connection,
		hooks: classConfig.hooks.provider,
		phpstan,
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
		});
		if (configuration.enabled && !configuration.singleFileMode) {
			void phpstan.check(undefined);
		}
	})();

	return {
		hoverProvider: createHoverProvider(providerArgs),
	};
}
