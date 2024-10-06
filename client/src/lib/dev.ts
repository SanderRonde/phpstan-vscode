declare const _INSPECT_BRK: boolean | undefined;

export const INSPECT_BRK =
	typeof _INSPECT_BRK === 'undefined' ? false : _INSPECT_BRK;
