import type { ClassConfig } from './phpstan/manager';

export function replaceVariables(str: string, config: ClassConfig): string {
	return str.replace(/\${workspaceFolder}/g, () => {
		const workspaceFolder = config.getWorkspaceFolder();
		if (!workspaceFolder) {
			throw new Error(
				'workspaceFolder is not set but is used in a variable'
			);
		}
		return workspaceFolder.fsPath;
	});
}
