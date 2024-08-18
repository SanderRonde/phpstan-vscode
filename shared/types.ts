export interface AsyncDisposable {
	dispose: () => Promise<void>;
}
