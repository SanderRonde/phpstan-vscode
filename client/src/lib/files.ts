import { RelativePattern, workspace, Uri } from 'vscode';
import { getEditorConfiguration } from './editorConfig';
import type { GlobPattern } from 'vscode';

export function findFiles(pattern: string, base?: string): Thenable<Uri[]> {
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
	const globPattern: GlobPattern = base
		? new RelativePattern(Uri.parse(base), pattern)
		: pattern;
	return workspace.findFiles(globPattern, `{${[...excludes].join(',')}}`);
}
