import type {
	Hover,
	HoverParams,
	ServerRequestHandler,
} from 'vscode-languageserver';
import { HOVER_PROVIDER_PREFIX, log } from '../lib/log';
import type { ProviderArgs } from './shared';
import { getFileReport } from './shared';

export function createHoverProvider(
	providerArgs: ProviderArgs
): ServerRequestHandler<HoverParams, Hover | undefined | null, never, void> {
	return async (hoverParams, cancelToken) => {
		const fileReport = await getFileReport(
			providerArgs,
			cancelToken,
			hoverParams.textDocument.uri
		);
		if (!fileReport) {
			return null;
		}

		// Look for it
		for (const type of fileReport.varValues ?? []) {
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
					contents: [
						`PHPStan: \`${type.typeDescription} $${type.name}\``,
					],
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
