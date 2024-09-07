import path = require('path');

export const EXTENSION_ID = 'sanderronde.phpstan-vscode';
// Disable cancelling of operations. Handy when stepping
// through an action as VSCode cancels long-running operations
export const NO_CANCEL_OPERATIONS = false;
// This file will end up in root/out/ so it's just one level back
export const ROOT_FOLDER = path.join(__dirname, '..');
export const MAX_HOVER_WAIT_TIME = 60000;
export const HOVER_WAIT_CHUNK_TIME = 50;
export const TREE_FETCHER_FILE = path.join(ROOT_FOLDER, 'php/TreeFetcher.php');
export const DIAGNOSER_FILE = path.join(ROOT_FOLDER, 'php/Diagnoser.php');
export const PHPSTAN_1_NEON_FILE = path.join(ROOT_FOLDER, 'php/config.neon');
export const PHPSTAN_2_NEON_FILE = path.join(ROOT_FOLDER, 'php/config.2.neon');
// Hard limit, process should never take longer than this
export const PROCESS_TIMEOUT = 1000 * 60 * 15;
export const CHECK_DEBOUNCE = 100;

export const SPAWN_ARGS = {
	shell: process.platform === 'win32',
	windowsVerbatimArguments: true,
};
