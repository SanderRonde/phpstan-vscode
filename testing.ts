import { spawn } from 'child_process';
const proc = spawn(
	'/home/sanderronde/crisp-demo/backend/vendor/bin/phpstan',
	[
		'analyse',
		'-c',
		'/home/sanderronde/crisp-demo/backend/phpstan.neon',
		'--error-format=json',
		'--no-interaction',
		'--memory-limit=4G',
		'--no-progress',
		'-a',
		'/home/sanderronde/phpstan-vscode/_config/autoload.php',
		'-c',
		'/home/sanderronde/phpstan-vscode/_config/config.neon',
		'--watch',
	],
	{
		// shell: false,
		// windowsVerbatimArguments: true,
		// cwd: '/home/sanderronde/crisp-demo/backend',
		env: { ...process.env, TMPDIR: '/home/sanderronde/crisp/cache/phpstan' },
	}
);

proc.stdout.on('data', (data) => {
	console.log(`stdout: ${data.toString()}`);
});
proc.stderr.on('data', (data) => {
	console.log(`stderr: ${data.toString()}`);
});