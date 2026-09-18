import {
	extractJsonPayload,
	sanitizePhpstanOutputChunk,
} from './phpstanOutput';
import * as assert from 'assert';

{
	const progress: { done: number; total: number; percentage: number }[] = [];
	let dockerPid: number | undefined;
	const sanitized = sanitizePhpstanOutputChunk(
		'docker-pid:4321\n  12/40 [====>-------]  30%\nNote: Using configuration file /tmp/phpstan.neon.\n\x1b[32m{"totals":{"errors":1}}\x1b[0m\n',
		{
			onDockerPid: (pid) => {
				dockerPid = pid;
			},
			onProgress: (value) => progress.push(value),
		}
	);

	assert.strictEqual(dockerPid, 4321);
	assert.deepStrictEqual(progress, [{ done: 12, total: 40, percentage: 30 }]);
	assert.strictEqual(sanitized.includes('docker-pid'), false);
	assert.strictEqual(sanitized.includes('12/40'), false);
	assert.strictEqual(sanitized.includes('Note: Using configuration'), false);
	assert.ok(sanitized.includes('{"totals":{"errors":1}}'));
}

{
	const payload = extractJsonPayload(
		'Note leftover\n{"files":{},"totals":{"errors":0,"file_errors":0}}\ntrailing'
	);
	assert.strictEqual(
		payload,
		'{"files":{},"totals":{"errors":0,"file_errors":0}}'
	);
}

{
	assert.strictEqual(extractJsonPayload('not json at all'), null);
	assert.strictEqual(extractJsonPayload(''), null);
}

console.log('shared/phpstanOutput.test.ts passed');
