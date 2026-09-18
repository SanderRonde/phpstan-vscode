export interface MergeableCheckErrors {
	fileSpecificErrors: Record<string, unknown>;
	notFileSpecificErrors: readonly string[];
}

/**
 * Keep each config file's last successful scan separately, then merge them
 * for display. Partial (single-file) scans overlay the current config's
 * previous file errors instead of replacing the whole project snapshot.
 */
export function mergeCheckErrors<E extends MergeableCheckErrors>(
	reported: E,
	configFile: string,
	isPartial: boolean,
	lastErrorsByConfig: Map<string, E>
): { publish: E; store: E } {
	const previous = lastErrorsByConfig.get(configFile);
	const store = {
		...reported,
		fileSpecificErrors: {
			...(isPartial ? previous?.fileSpecificErrors ?? {} : {}),
			...reported.fileSpecificErrors,
		},
		notFileSpecificErrors: [...reported.notFileSpecificErrors],
	} as E;

	let fileSpecificErrors = {
		...store.fileSpecificErrors,
	};
	let notFileSpecificErrors = [...store.notFileSpecificErrors];

	for (const [otherConfig, otherErrors] of lastErrorsByConfig) {
		if (otherConfig === configFile) {
			continue;
		}
		fileSpecificErrors = {
			...otherErrors.fileSpecificErrors,
			...fileSpecificErrors,
		};
		notFileSpecificErrors = [
			...notFileSpecificErrors,
			...otherErrors.notFileSpecificErrors,
		];
	}

	const publish = {
		...store,
		fileSpecificErrors,
		notFileSpecificErrors,
	} as E;

	return { publish, store };
}
