export const PHP_LANGUAGE_ID = 'php';
export const BLADE_LANGUAGE_ID = 'blade';

// Keep in sync with the `onLanguage` activation events in package.json,
// those are not generated from this file
export const SUPPORTED_LANGUAGE_IDS = [
	PHP_LANGUAGE_ID,
	BLADE_LANGUAGE_ID,
] as const;

export function isSupportedLanguageId(languageId: string): boolean {
	return (SUPPORTED_LANGUAGE_IDS as readonly string[]).includes(languageId);
}
