import { matchesNeonPath } from './neon';
import * as assert from 'assert';
import * as path from 'path';

const configDir = path.posix.join('/proj', 'phpstan');
const srcDir = path.posix.join(configDir, 'src');

assert.strictEqual(
	matchesNeonPath(srcDir, path.posix.join(srcDir, 'Foo.php')),
	true
);
assert.strictEqual(
	matchesNeonPath(srcDir, path.posix.join(srcDir, 'nested', 'Bar.php')),
	true
);
assert.strictEqual(matchesNeonPath(srcDir, `${srcDir}-extra/Foo.php`), false);
assert.strictEqual(
	matchesNeonPath(
		path.posix.join(configDir, 'src', '*.php'),
		path.posix.join(srcDir, 'Foo.php')
	),
	true
);
assert.strictEqual(
	matchesNeonPath(
		path.posix.join(configDir, 'src', '*.php'),
		path.posix.join(srcDir, 'nested', 'Foo.php')
	),
	false
);
assert.strictEqual(
	matchesNeonPath(
		path.posix.join(configDir, 'src', '**', '*.php'),
		path.posix.join(srcDir, 'nested', 'Foo.php')
	),
	true
);
assert.strictEqual(matchesNeonPath(srcDir, srcDir), true);

console.log('shared/neon.test.ts passed');
