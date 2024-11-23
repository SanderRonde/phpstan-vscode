import { getEditorConfiguration } from './editorConfig';
import { workspace } from 'vscode';
import type { Uri } from 'vscode';

export function findFiles(pattern: string): Thenable<Uri[]> {
	const editorConfig = getEditorConfiguration();
	const excludes = new Set<string>(['**/vendor/**']);
	const excludeFiles = editorConfig.get('files.exclude');
	for (const key in excludeFiles) {
		if (excludeFiles[key]) {
			excludes.add(key);
		}
	}
	const excludeSearch = editorConfig.get('search.exclude');
	for (const key in excludeSearch) {
		if (excludeSearch[key]) {
			excludes.add(key);
		}
	}
	return workspace.findFiles(pattern, `{${[...excludes].join(',')}}`);
}
