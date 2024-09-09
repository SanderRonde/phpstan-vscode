import type { PHPStanCheckManager } from './phpstan/checkManager';
import type { AsyncDisposable, ClassConfig } from './types';
import type { DocumentManager } from './documentManager';
import { type Disposable } from 'vscode';

// Temporarily(?) disabled since it heavily impacts the CPU
export class Watcher implements AsyncDisposable {
	private readonly _disposables: Set<Disposable> = new Set();
	// private _filesWatcher: FilesWatcher | null = null;
	// private readonly _checkDebouncer = new CheckDebouncer();
	public documentManager: DocumentManager | null = null;

	public constructor(
		private readonly _classConfig: ClassConfig,
		private readonly _checkManager: PHPStanCheckManager
	) {
		// void this._init();
	}

	// 	private async _init(): Promise<void> {
	// 		const version = await this._classConfig.version.get();
	// 		if (!version) {
	// 			return;
	// 		}

	// 		if (!(version.major > 1 || version.minor >= 12)) {
	// 			return;
	// 		}

	// 		// Periodically refresh in case files are added
	// 		const interval = setInterval(
	// 			() => {
	// 				void this.onConfigChange();
	// 			},
	// 			1000 * 60 * 5
	// 		);
	// 		setTimeout(() => {
	// 			// Don't immediately watch due to the relatively high overhead of watching
	// 			void this.onConfigChange();
	// 		}, 1000 * 10);
	// 		this._disposables.add({
	// 			dispose: () => {
	// 				clearInterval(interval);
	// 			},
	// 		});
	// 	}

	// 	private async _getFiles(): Promise<string[]> {
	// 		// Gather to-watch files
	// 		const diagnosis = new PHPStanDiagnose(this._classConfig);
	// 		const runningCheck = withTimeout<
	// 			ReturnResult<string>,
	// 			Promise<ReturnResult<string>>
	// 		>({
	// 			resolve: diagnosis.diagnose(() => {}),
	// 			dispose: new Promise((resolve) =>
	// 				diagnosis.disposables.push({
	// 					dispose: () => Promise.resolve(resolve()),
	// 				})
	// 			),
	// 			timeout: 1000 * 60,
	// 			onKill: async () => {
	// 				await diagnosis.dispose();
	// 				return ReturnResult.killed();
	// 			},
	// 		});
	// 		this._disposables.add(runningCheck);
	// 		diagnosis.disposables.push(runningCheck);

	// 		const result = await runningCheck.promise;
	// 		this._disposables.delete(runningCheck);
	// 		if (!result.success()) {
	// 			return [];
	// 		}

	// 		const lines = result.value.split('\n');
	// 		for (const line of lines) {
	// 			const match = /PHPStanVSCodeDiagnoser:(.*)/.exec(line);
	// 			if (match) {
	// 				return JSON.parse(match[1]) as string[];
	// 			}
	// 		}
	// 		return [];
	// 	}

	public async onConfigChange(): Promise<void> {}

	// 	public async onConfigChange(): Promise<void> {
	// 		const editorConfig = await getEditorConfiguration(this._classConfig);
	// 		if (
	// 			editorConfig.singleFileMode ||
	// 			!editorConfig.enabled ||
	// 			!this.documentManager
	// 		) {
	// 			await this._filesWatcher?.dispose();
	// 			this._filesWatcher = null;
	// 			return;
	// 		}

	// 		const files = await this._checkDebouncer.debounceWithKey(
	// 			'get-files',
	// 			() => {
	// 				return this._getFiles();
	// 			}
	// 		);

	// 		if (this._filesWatcher) {
	// 			const watchedFiles = this._filesWatcher.files;
	// 			const watchedFilePaths = Object.values(watchedFiles).flat();
	// 			const newFilesSet = new Set(files);

	// 			if (
	// 				watchedFilePaths.length === files.length &&
	// 				watchedFilePaths.every((file) => newFilesSet.has(file))
	// 			) {
	// 				// If files didn't change, don't re-watch
	// 				return;
	// 			}
	// 			await this._filesWatcher.dispose();
	// 		}

	// 		this._filesWatcher = new FilesWatcher(
	// 			this._classConfig,
	// 			this._checkManager,
	// 			files,
	// 			this.documentManager
	// 		);
	// 		await this._filesWatcher.init();
	// 	}

	public async dispose(): Promise<void> {
		await Promise.all(
			[...this._disposables.values()].map((d) => void d.dispose())
		);
		this._disposables.clear();
		// await this._filesWatcher?.dispose();
		// this._filesWatcher = null;
	}
}

// class FilesWatcher implements AsyncDisposable {
// 	private _disposables: Disposable[] = [];

// 	public constructor(
// 		private readonly _classConfig: ClassConfig,
// 		private readonly _checkManager: PHPStanCheckManager,
// 		public readonly files: string[],
// 		private readonly _documentManager: DocumentManager
// 	) {}

// 	public async init(): Promise<void> {
// 		const workspaceFolders = await this._classConfig.workspaceFolders.get();
// 		if (!workspaceFolders) {
// 			return;
// 		}

// 		const watcher = chokidar.watch(
// 			workspaceFolders.default.fsPath + '/**/*.php',
// 			{
// 				ignoreInitial: true,
// 				usePolling: false,
// 				persistent: false,
// 				awaitWriteFinish: {
// 					stabilityThreshold: 100,
// 				},
// 			}
// 		);
// 		// eslint-disable-next-line @typescript-eslint/no-misused-promises
// 		watcher.on('change', async (filename) => {
// 			if (this.files.includes(filename)) {
// 				await this._documentManager.onDocumentChange(
// 					this._checkManager,
// 					{
// 						uri: URI.file(filename).toString(),
// 						content: await fs.readFile(filename, 'utf8'),
// 						languageId: 'php',
// 					}
// 				);
// 			}
// 		});
// 		this._disposables.push({
// 			dispose: () => {
// 				return watcher.close();
// 			},
// 		});
// 	}

// 	public async dispose(): Promise<void> {
// 		await Promise.all(this._disposables.map((d) => void d.dispose()));
// 		this._disposables = [];
// 	}
// }
