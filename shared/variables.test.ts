import type { WorkspaceFolders } from '../server/src/lib/types';
import { replaceVariables } from './variables';
import * as assert from 'assert';

const folders = {
	byName: {
		'my-app': { fsPath: '/work/my-app' },
		Primary: { fsPath: '/work/primary' },
	},
	getForPath: () => undefined,
	default: { fsPath: '/work/primary' },
} as unknown as WorkspaceFolders;

assert.strictEqual(
	replaceVariables('${workspaceFolder:my-app}/phpstan.neon', folders),
	'/work/my-app/phpstan.neon'
);
assert.strictEqual(
	replaceVariables('${workspaceFolder}/vendor/bin/phpstan', folders),
	'/work/primary/vendor/bin/phpstan'
);
assert.strictEqual(
	replaceVariables('${workspaceFolder:Primary}/src', folders),
	'/work/primary/src'
);

console.log('shared/variables.test.ts passed');
