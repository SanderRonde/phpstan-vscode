import type { ExtensionContext } from 'vscode';
import * as fs from 'fs/promises';

interface InstallationConfigFormat {
	version?: string;
}

async function readOrCreateInstallationConfig(
	context: ExtensionContext
): Promise<string> {
	const filePath = context.asAbsolutePath('user_config.json');
	try {
		return await fs.readFile(filePath, 'utf8');
	} catch (e) {
		const fileContent = JSON.stringify({});
		await fs.writeFile(filePath, fileContent, 'utf8');
		return fileContent;
	}
}

export async function getInstallationConfig(
	context: ExtensionContext
): Promise<InstallationConfigFormat> {
	const content = await readOrCreateInstallationConfig(context);
	return JSON.parse(content) as InstallationConfigFormat;
}

export async function writeInstallationConfig(
	context: ExtensionContext,
	installationConfig: InstallationConfigFormat
): Promise<void> {
	await fs.writeFile(
		context.asAbsolutePath('user_config.json'),
		JSON.stringify(installationConfig),
		'utf8'
	);
}
