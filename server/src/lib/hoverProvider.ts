import {
	HOVER_WAIT_CHUNK_TIME,
	MAX_HOVER_WAIT_TIME,
	NO_CANCEL_OPERATIONS,
} from '../../../shared/constants';
import type {
	Hover,
	HoverParams,
	ServerRequestHandler,
} from 'vscode-languageserver';
import { waitPeriodical } from '../../../shared/util';
import type { PHPStan } from './phpstan';
import * as fs from 'fs/promises';
import { URI } from 'vscode-uri';
import * as path from 'path';

interface VariableData {
	typeDescription: string;
	name: string;
	pos: {
		start: {
			line: number;
			char: number;
		};
		end: {
			line: number;
			char: number;
		};
	};
}

export interface FileReport {
	timestamp: number;
	data: VariableData[];
}

export type ReporterFile = Record<string, FileReport>;

export function createHoverProvider(
	phpstan: PHPStan,
	getWorkspaceFolder: () => string | null
): ServerRequestHandler<HoverParams, Hover | undefined | null, never, void> {
	return async (hoverParams, cancelToken) => {
		const workspaceFolder = getWorkspaceFolder();
		if (
			!workspaceFolder ||
			(!NO_CANCEL_OPERATIONS && cancelToken.isCancellationRequested)
		) {
			return null;
		}

		// Ensure the file has been checked
		await phpstan.ensureFileChecked(hoverParams.textDocument);

		// Check if the file is currently being checked. If so, wait for that to end.
		const result = await waitPeriodical<'cancel' | 'checkDone'>(
			MAX_HOVER_WAIT_TIME,
			HOVER_WAIT_CHUNK_TIME,
			() => {
				if (
					!NO_CANCEL_OPERATIONS &&
					cancelToken.isCancellationRequested
				) {
					return 'cancel';
				}
				if (
					!phpstan.fileIsPending(
						URI.parse(hoverParams.textDocument.uri).fsPath
					)
				) {
					return 'checkDone';
				}
				return null;
			}
		);

		// Either timed out or was canceled
		if (result !== 'checkDone') {
			return null;
		}

		// Read reporter file
		const reporterFile: ReporterFile = JSON.parse(
			await fs.readFile(path.join(workspaceFolder, 'reported.json'), {
				encoding: 'utf8',
			})
		);

		if (!NO_CANCEL_OPERATIONS && cancelToken.isCancellationRequested) {
			return null;
		}

		// Look for it
		for (const type of reporterFile[
			URI.parse(hoverParams.textDocument.uri).fsPath
		]?.data ?? []) {
			if (
				type.pos.start.line === hoverParams.position.line &&
				type.pos.start.char < hoverParams.position.character &&
				type.pos.end.char > hoverParams.position.character
			) {
				return {
					contents: [
						`PHPStan: \`${type.typeDescription} $${type.name}\``,
					],
				};
			}
		}

		return null;
	};
}
