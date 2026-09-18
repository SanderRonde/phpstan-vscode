import {
	compareConfigDirOrder,
	getPathMapper,
	isPathEqualOrInside,
	shellQuote,
} from './util';
import * as assert from 'assert';
import * as path from 'path';

assert.strictEqual(
	isPathEqualOrInside('/workspace/src/a.php', '/workspace'),
	true
);
assert.strictEqual(isPathEqualOrInside('/workspace', '/workspace'), true);
assert.strictEqual(
	isPathEqualOrInside('/workspace-other/src/a.php', '/workspace'),
	false
);

{
	const mapper = getPathMapper({ '/host/app': '/app' });
	assert.strictEqual(mapper('/host/app/src/Foo.php'), '/app/src/Foo.php');
	assert.strictEqual(
		mapper('/app/src/Foo.php', true),
		'/host/app/src/Foo.php'
	);
	assert.strictEqual(
		mapper('/application/Foo.php', true),
		'/application/Foo.php'
	);
}

{
	const mapper = getPathMapper({
		'/app': '/short',
		'/app/module': '/long',
	});
	assert.strictEqual(mapper('/app/module/x.php'), '/long/x.php');
}

{
	const fileDir = path.join('/proj', 'src', 'nested');
	const same = path.join('/proj', 'src', 'nested');
	const parent = path.join('/proj', 'src');
	const root = path.join('/proj');
	const child = path.join('/proj', 'src', 'nested', 'lib');

	assert.ok(compareConfigDirOrder(fileDir, same, parent) < 0);
	assert.ok(compareConfigDirOrder(fileDir, parent, root) < 0);
	assert.ok(compareConfigDirOrder(fileDir, parent, child) < 0);
}

assert.strictEqual(shellQuote("foo'bar"), `'foo'\\''bar'`);
assert.strictEqual(shellQuote('plain'), `'plain'`);

console.log('shared/util.test.ts passed');
