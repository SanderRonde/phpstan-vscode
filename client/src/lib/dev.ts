declare const _DEBUG: boolean | undefined;
declare const _INSPECT_BRK: boolean | undefined;

export const DEBUG = typeof _DEBUG === 'undefined' ? false : _DEBUG;
export const INSPECT_BRK =
	typeof _INSPECT_BRK === 'undefined' ? false : _INSPECT_BRK;
