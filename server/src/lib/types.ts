import type { ProviderCheckHooks } from '../providers/providerUtil';
import type { PHPStanVersion } from '../start/getVersion';
import type { _Connection } from 'vscode-languageserver';
import type { ProcessSpawner } from './procSpawner';
import type { StatusBar } from './statusBar';
import type { URI } from 'vscode-uri';

export interface ClassConfig {
	statusBar: StatusBar;
	connection: _Connection;
	workspaceFolders: PromisedValue<WorkspaceFolders | null>;
	hooks: {
		provider: ProviderCheckHooks;
	};
	procSpawner: ProcessSpawner;
	version: PromisedValue<PHPStanVersion | null>;
}

export type WorkspaceFolders = {
	[name: string]: URI | undefined;
	default: URI;
};

export class PromisedValue<V> {
	private _resolve!: (value: V) => void;
	private readonly _promise: Promise<V>;
	private _wasSet: boolean = false;

	public constructor() {
		this._promise = new Promise<V>((resolve) => {
			this._resolve = resolve;
		});
	}

	public set(value: V): void {
		this._resolve(value);
		this._wasSet = true;
	}

	public get(): Promise<V> {
		return this._promise;
	}

	public isSet(): boolean {
		return this._wasSet;
	}
}

export interface AsyncDisposable {
	dispose: () => Promise<void>;
}
