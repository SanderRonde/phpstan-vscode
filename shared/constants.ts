import path = require('path');

export const EXTENSION_ID = 'sanderronde.phpstan-vscode';
// Disable cancelling of operations. Handy when stepping
// through an action as VSCode cancels long-running operations
export const NO_CANCEL_OPERATIONS = true;
// This file will end up in root/out/ so it's just one level back
export const ROOT_FOLDER = path.join(__dirname, '..');
export const MAX_HOVER_WAIT_TIME = 60000;
export const HOVER_WAIT_CHUNK_TIME = 50;
export const TREE_FETCHER_FILE = path.join(ROOT_FOLDER, 'php/TreeFetcher.php');
