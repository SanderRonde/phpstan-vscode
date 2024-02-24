import type { ClassConfig } from './phpstan/manager';

export function replaceVariables(str: string, config: ClassConfig): string {
	return str.replace(
		/\${workspaceFolder(?::(\w+))?}/g,
		(_fullMatch, workspaceName: string | undefined) => {
			if (workspaceName) {
				const workspaceFoldersByName = config.getWorkspaceFolders();
				if (!workspaceFoldersByName) {
					throw new Error(
						'workspaceFolder:name is not set but is used in a variable'
					);
				}
				const folder = workspaceFoldersByName[workspaceName];
				if (!folder) {
					throw new Error(
						`workspaceFolder:${workspaceName} is not set but is used in a variable`
					);
				}
				return folder.fsPath;
			}

			const workspaceFolder = config.getWorkspaceFolders()?.default;
			if (!workspaceFolder) {
				throw new Error(
					'workspaceFolder is not set but is used in a variable'
				);
			}
			return workspaceFolder.fsPath;
		}
	);
}
