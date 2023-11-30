import type { ClassConfig } from './phpstan/manager';

export async function replaceVariables(
	str: string,
	config: ClassConfig
): Promise<string> {
	const workspaceFolder = await config.workspaceFolder.get();
	return str.replace(/\${workspaceFolder}/g, () => {
		if (!workspaceFolder) {
			throw new Error(
				'workspaceFolder is not set but is used in a variable'
			);
		}
		return workspaceFolder.fsPath;
	});
}
