export interface PhpstanProgress {
	done: number;
	total: number;
	percentage: number;
}

const PROGRESS_PATTERN = /(\d+)\/(\d+)\s+\[.*?\]\s+(\d+)%/g;
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*[A-Za-z]/g;
const CONFIG_NOTE_PATTERN = /Note: Using configuration file[^\n]*/g;
const DOCKER_PID_PATTERN = /docker-pid:(\d+)/;

/**
 * Strip PHPStan / docker bookkeeping from a process output chunk while
 * keeping any JSON (or other payload) that arrived in the same buffer.
 */
export function sanitizePhpstanOutputChunk(
	chunk: string,
	options: {
		onDockerPid?: (pid: number) => void;
		onProgress?: (progress: PhpstanProgress) => void;
	} = {}
): string {
	let remaining = chunk;

	const pidMatch = DOCKER_PID_PATTERN.exec(remaining);
	if (pidMatch) {
		options.onDockerPid?.(parseInt(pidMatch[1], 10));
		remaining = remaining.replace(pidMatch[0], '');
	}

	if (options.onProgress) {
		const progressMatch = [...remaining.matchAll(PROGRESS_PATTERN)];
		if (progressMatch.length) {
			const [, done, total, percentage] =
				progressMatch[progressMatch.length - 1];
			options.onProgress({
				done: parseInt(done, 10),
				total: parseInt(total, 10),
				percentage: parseInt(percentage, 10),
			});
			remaining = remaining.replace(PROGRESS_PATTERN, '');
		}
	}

	remaining = remaining.replace(CONFIG_NOTE_PATTERN, '');
	remaining = remaining.replace(ANSI_PATTERN, '');
	return remaining;
}

/**
 * PHPStan JSON is often mixed with progress / notices on stdout. Prefer a
 * complete JSON object if one can be parsed from the captured output.
 */
export function extractJsonPayload(stdout: string): string | null {
	const trimmed = stdout.trim();
	if (!trimmed) {
		return null;
	}

	try {
		JSON.parse(trimmed);
		return trimmed;
	} catch {
		const start = trimmed.indexOf('{');
		const end = trimmed.lastIndexOf('}');
		if (start === -1 || end <= start) {
			return null;
		}
		const slice = trimmed.slice(start, end + 1);
		try {
			JSON.parse(slice);
			return slice;
		} catch {
			return null;
		}
	}
}
