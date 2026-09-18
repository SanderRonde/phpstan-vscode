import {
	isSupportedLanguageId,
	shouldCheckDocument,
	SUPPORTED_LANGUAGE_IDS,
} from './languages';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';

assert.strictEqual(isSupportedLanguageId('php'), true);
assert.strictEqual(isSupportedLanguageId('blade'), true);
assert.strictEqual(isSupportedLanguageId('javascript'), false);
assert.strictEqual(isSupportedLanguageId('html'), false);

assert.strictEqual(shouldCheckDocument('php', 'file:///src/Example.php'), true);
assert.strictEqual(
	shouldCheckDocument('blade', 'file:///resources/views/welcome.blade.php'),
	true
);
assert.strictEqual(
	shouldCheckDocument('php', 'file:///src/Example.php.git'),
	false
);
assert.strictEqual(
	shouldCheckDocument('javascript', 'file:///src/app.js'),
	false
);

const packageJson = JSON.parse(
	fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
) as { activationEvents: string[] };
const expectedActivationEvents = SUPPORTED_LANGUAGE_IDS.map(
	(languageId) => `onLanguage:${languageId}`
);
assert.deepStrictEqual(
	packageJson.activationEvents,
	expectedActivationEvents,
	'package.json activationEvents must stay in sync with SUPPORTED_LANGUAGE_IDS'
);

console.log('shared/languages.test.ts passed');
