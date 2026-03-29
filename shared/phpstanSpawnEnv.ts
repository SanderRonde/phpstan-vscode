/**
 * Environment variable names PHPStan uses to detect AI coding agents
 * (see PHPStan AgentDetector). When the extension runs inside an agent-capable
 * editor, these may be set and skew analysis; they are cleared for child processes.
 */
export const PHPSTAN_AGENT_DETECTOR_ENV_VARS = [
	'AI_AGENT',
	'CURSOR_TRACE_ID',
	'CURSOR_AGENT',
	'GEMINI_CLI',
	'CODEX_SANDBOX',
	'AUGMENT_AGENT',
	'OPENCODE_CLIENT',
	'OPENCODE',
	'CLAUDECODE',
	'CLAUDE_CODE',
	'REPL_ID',
] as const;

export function stripPhpstanAgentDetectorEnvVars<T extends NodeJS.ProcessEnv>(
	env: T
): T {
	const out = { ...env };
	for (const key of PHPSTAN_AGENT_DETECTOR_ENV_VARS) {
		delete out[key];
	}
	return out;
}
