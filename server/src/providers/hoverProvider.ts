import type {
	Hover,
	HoverParams,
	ServerRequestHandler,
} from 'vscode-languageserver';
import { getFileReport, providerEnabled } from './providerUtil';
import { HOVER_PROVIDER_PREFIX, log } from '../lib/log';
import type { ProviderArgs } from './providerUtil';

function isHoverInTypeRange(
	position: { line: number; character: number },
	type: {
		pos: {
			start: { line: number; char: number };
			end: { line: number; char: number };
		};
	}
): boolean {
	const { start, end } = type.pos;
	if (position.line < start.line || position.line > end.line) {
		return false;
	}
	if (start.line === end.line) {
		return (
			position.character >= start.char && position.character <= end.char
		);
	}
	if (position.line === start.line) {
		return position.character >= start.char;
	}
	if (position.line === end.line) {
		return position.character <= end.char;
	}
	return true;
}

function typeRangeSize(type: {
	pos: {
		start: { line: number; char: number };
		end: { line: number; char: number };
	};
}): number {
	if (type.pos.start.line === type.pos.end.line) {
		return type.pos.end.char - type.pos.start.char;
	}
	return (
		(type.pos.end.line - type.pos.start.line) * 1000 +
		type.pos.end.char +
		(1000 - type.pos.start.char)
	);
}

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
		const matches = (fileReport ?? []).filter((type) =>
			isHoverInTypeRange(hoverParams.position, type)
		);
		matches.sort((a, b) => typeRangeSize(a) - typeRangeSize(b));
		const type = matches[0];
		if (type) {
			log(HOVER_PROVIDER_PREFIX, 'Found hover type');
			return {
				contents: [`PHPStan: \`${type.typeDescr} $${type.name}\``],
			};
		}

		log(HOVER_PROVIDER_PREFIX, 'Hovering, no type found');

		return null;
	};
}
