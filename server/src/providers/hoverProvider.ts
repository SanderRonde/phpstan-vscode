import type {
	Hover,
	HoverParams,
	ServerRequestHandler,
} from 'vscode-languageserver';
import { getFileReport, providerEnabled } from './providerUtil';
import { HOVER_PROVIDER_PREFIX, log } from '../lib/log';
import type { ProviderArgs } from './providerUtil';

export function createHoverProvider(
	providerArgs: ProviderArgs
): ServerRequestHandler<HoverParams, Hover | undefined | null, never, void> {
	return async (hoverParams, cancelToken) => {
		await providerArgs.onConnectionInitialized;
		if (cancelToken.isCancellationRequested) {
			return null;
		}

		if (!(await providerEnabled(providerArgs))) {
			return null;
		}

		const fileReport = await getFileReport(
			providerArgs,
			cancelToken,
			hoverParams.textDocument.uri
		);
		if (!fileReport) {
			return null;
		}

		// Look for it
		for (const type of fileReport ?? []) {
			if (
				type.pos.start.line === hoverParams.position.line &&
				type.pos.start.char < hoverParams.position.character &&
				type.pos.end.char > hoverParams.position.character
			) {
				void log(
					providerArgs.connection,
					HOVER_PROVIDER_PREFIX,
					'Found hover type'
				);
				return {
					contents: [`PHPStan: \`${type.typeDescr} $${type.name}\``],
				};
			}
		}

		void log(
			providerArgs.connection,
			HOVER_PROVIDER_PREFIX,
			'Hovering, no type found'
		);

		return null;
	};
}
