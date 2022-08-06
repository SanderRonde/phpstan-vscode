#!/bin/bash
//bin/true && exec /usr/bin/env yarn --silent --ignore-engines tsx $0 $@

import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import * as tmp from 'tmp-promise';
import * as fs from 'fs/promises';
import * as path from 'path';

const ROOT_DIR = path.join(__dirname, '../');
const ENCODING = {
	encoding: 'utf8',
} as const;

interface Args {
	input: string;
	output?: string;
	silent?: boolean;
	runOnly?: boolean;
}

function getArgs(): Args {
	const args: Partial<Args> = {};
	for (let i = 2; i < process.argv.length; i++) {
		const arg = process.argv[i];
		if (arg === '-i') {
			args.input = process.argv[i + 1];
			i++;
		} else if (arg === '-o') {
			args.output = process.argv[i + 1];
			i++;
		} else if (arg === '-r') {
			args.runOnly = true;
		} else if (arg === '-s') {
			args.silent = true;
		} else {
			args.input = arg;
		}
	}

	if (!args.input) {
		throw new Error('Missing input file, please supply one');
	}
	if (!args.input.endsWith('.php')) {
		throw new Error('Input file must be a PHP file');
	}

	return args as Args;
}

interface CommandPrep {
	hasNoOutput: boolean;
	autoloadFile: string;
	dispose: () => Promise<void>;
}

async function setupCommand(args: Args): Promise<CommandPrep> {
	const hasNoOutput = !args.output;
	const tmpDir = await tmp.dir();
	if (hasNoOutput) {
		args.output = path.join(tmpDir.path, 'output.json');
	}
	const treeFetcherPath = path.join(tmpDir.path, 'TreeFetcher.php');
	const treeFetcherContent = (
		await fs.readFile(path.join(ROOT_DIR, 'php/TreeFetcher.php'), ENCODING)
	).replace('reported.json', args.output!);
	await fs.writeFile(treeFetcherPath, treeFetcherContent, ENCODING);

	const autoloadFilePath = path.join(tmpDir.path, 'autoload.php');
	const autoloadFileConent = `<?php\nrequire_once "${treeFetcherPath}";`;
	await fs.writeFile(autoloadFilePath, autoloadFileConent, ENCODING);

	return {
		hasNoOutput,
		autoloadFile: autoloadFilePath,
		dispose: async () => {
			await fs.rm(tmpDir.path, { recursive: true });
		},
	};
}

function runCommand(prep: CommandPrep, args: Args): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		const command = [
			'analyse',
			'-c',
			path.join(ROOT_DIR, 'php/config.neon'),
			'-a',
			prep.autoloadFile,
			'--debug',
			args.input,
			'--memory-limit=4G',
		];

		const proc = spawn(
			path.join(ROOT_DIR, 'php/vendor/bin/phpstan'),
			command,
			{
				shell: process.platform === 'win32',
				windowsVerbatimArguments: true,
			}
		);
		if (!args.silent) {
			proc.stdout.pipe(process.stdout);
			proc.stderr.pipe(process.stderr);
		}

		proc.on('error', (e) => {
			reject(new Error('Failed to run phpstan: ' + e.message));
		});
		proc.on('exit', () => {
			resolve();
		});
	});
}

async function main(): Promise<void> {
	const args = getArgs();
	const prep = await setupCommand(args);
	await runCommand(prep, args);
	if (prep.hasNoOutput && !args.runOnly) {
		createReadStream(args.output!).pipe(process.stdout);
	}
	if (!args.silent) {
		console.log('Done!');
	}
	await prep.dispose();
}

void main();
