import { mergeCheckErrors } from './mergeCheckErrors';
import * as assert from 'assert';

type Errors = {
	fileSpecificErrors: Record<string, string[]>;
	notFileSpecificErrors: string[];
};

const fileA: Errors = {
	fileSpecificErrors: { 'file:///a.php': ['a1'] },
	notFileSpecificErrors: ['global-a'],
};
const fileB: Errors = {
	fileSpecificErrors: { 'file:///b.php': ['b1'] },
	notFileSpecificErrors: ['global-b'],
};
const fileAPartial: Errors = {
	fileSpecificErrors: { 'file:///a.php': ['a2'] },
	notFileSpecificErrors: [],
};

{
	const last = new Map<string, Errors>([['phpstan.neon', fileA]]);
	const merged = mergeCheckErrors(fileB, 'phpstan.other.neon', false, last);

	assert.deepStrictEqual(merged.store, fileB);
	assert.deepStrictEqual(merged.publish.fileSpecificErrors, {
		'file:///a.php': ['a1'],
		'file:///b.php': ['b1'],
	});
	assert.deepStrictEqual(merged.publish.notFileSpecificErrors, [
		'global-b',
		'global-a',
	]);
}

{
	const last = new Map<string, Errors>([['phpstan.neon', fileA]]);
	const merged = mergeCheckErrors(fileAPartial, 'phpstan.neon', true, last);

	assert.deepStrictEqual(merged.store.fileSpecificErrors, {
		'file:///a.php': ['a2'],
	});
	assert.deepStrictEqual(merged.publish.fileSpecificErrors, {
		'file:///a.php': ['a2'],
	});
}

{
	const last = new Map<string, Errors>([
		['phpstan.neon', fileA],
		['other.neon', fileB],
	]);
	const projectRescan: Errors = {
		fileSpecificErrors: { 'file:///a.php': ['a3'] },
		notFileSpecificErrors: ['global-a3'],
	};
	const merged = mergeCheckErrors(projectRescan, 'phpstan.neon', false, last);

	assert.deepStrictEqual(merged.store, projectRescan);
	assert.deepStrictEqual(merged.publish.fileSpecificErrors, {
		'file:///b.php': ['b1'],
		'file:///a.php': ['a3'],
	});
}

console.log('shared/mergeCheckErrors.test.ts passed');
