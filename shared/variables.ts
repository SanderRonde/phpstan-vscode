import type { WorkspaceFolders } from '../server/src/lib/types';
import * as os from 'os';

export function replaceVariables(
	str: string,
	workspaceFolders: WorkspaceFolders | null
): string {
	return str.replace(
		/\${workspaceFolder(?::(\w+))?}/g,
		(_fullMatch, workspaceName: string | undefined) => {
			if (workspaceName) {
				if (!workspaceFolders) {
					throw new Error(
						'workspaceFolder:name is not set but is used in a variable'
					);
				}
				const folder = workspaceFolders.byName[workspaceName];
				if (!folder) {
					throw new Error(
						`workspaceFolder:${workspaceName} is not set but is used in a variable`
					);
				}
				return folder.fsPath;
			}

			if (!workspaceFolders?.default) {
				throw new Error(
					'workspaceFolder is not set but is used in a variable'
				);
			}
			return workspaceFolders.default.fsPath;
		}
	);
}

export function replaceHomeDir(str: string): string {
	return str.replace(/^~/, os.homedir());
}
