import { basicHash, createPromise, withTimeout } from '../../../../shared/util';
import type { PHPStanVersion, WorkspaceFolders } from '../../server';
import type { ProviderCheckHooks } from '../../providers/shared';
import { OperationStatus } from '../../../../shared/statusBar';
import type { PromiseObject } from '../../../../shared/util';
import type { DocumentManager } from '../documentManager';
import { checkPrefix, log, MANAGER_PREFIX } from '../log';
import type { _Connection } from 'vscode-languageserver';
import type { Disposable } from 'vscode-languageserver';
import type { ReportedErrors } from './outputParser';
import type { PromisedValue } from '../../server';
import type { StatusBar } from '../statusBar';
import type { ProcessSpawner } from '../proc';
import { executeCommand } from '../commands';
import { getConfiguration } from '../config';
import { showError } from '../errorUtil';
import { ReturnResult } from './result';
import { PHPStanCheck } from './check';

export interface ClassConfig {
	statusBar: StatusBar;
	connection: _Connection;
	workspaceFolders: PromisedValue<WorkspaceFolders | null>;
	documents: DocumentManager;
	hooks: {
		provider: ProviderCheckHooks;
	};
	procSpawner: ProcessSpawner;
	version: PromisedValue<PHPStanVersion | null>;
}

interface CheckOperation {
	check: PHPStanCheck;
	hashes: Record<string, string>;
}
type RecursivePromiseObject = PromiseObject<RecursivePromiseObject> | null;

const PROJECT_CHECK_STR = '__project__';
export class PHPStanCheckManager implements Disposable {
	private _operation: CheckOperation | null = null;
	private _filePromises: Map<string, RecursivePromiseObject> = new Map();
	private readonly _disposables: Disposable[] = [];

	public constructor(private readonly _config: ClassConfig) {}

	private async _onTimeout(check: PHPStanCheck): Promise<void> {
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		if (!config.suppressTimeoutMessage) {
			showError(
				this._config.connection,
				`PHPStan check timed out after ${config.projectTimeout}ms`,
				[
					{
						title: 'Adjust timeout',
						callback: () => {
							void executeCommand(
								this._config.connection,
								'workbench.action.openSettings',
								'phpstan.projectCheckTimeout'
							);
						},
					},
					{
						title: 'Stop showing this message',
						callback: () => {
							void executeCommand(
								this._config.connection,
								'workbench.action.openSettings',
								'phpstan.suppressTimeoutMessage'
							);
						},
					},
				]
			);
		}
		void log(
			this._config.connection,
			checkPrefix(check),
			`PHPStan check timed out after ${config.projectTimeout}ms`
		);
	}

	private _toErrorMessageMap(result: ReturnResult<ReportedErrors>): {
		fileSpecificErrors: Record<string, string[]>;
		notFileSpecificErrors: string[];
	} {
		if (result.success()) {
			const fileSpecificErrors: Record<string, string[]> = {};
			for (const uri in result.value.fileSpecificErrors) {
				fileSpecificErrors[uri] = result.value.fileSpecificErrors[
					uri
				].map((err) => err.message);
			}
			return {
				fileSpecificErrors,
				notFileSpecificErrors: result.value.notFileSpecificErrors,
			};
		}
		return {
			fileSpecificErrors: {},
			notFileSpecificErrors: [],
		};
	}

	private async _getFilePromise(uri: string): Promise<void> {
		if (!this._filePromises.has(uri)) {
			return Promise.resolve();
		}
		let obj: RecursivePromiseObject = this._filePromises.get(uri)!;
		do {
			obj = await obj.promise;
		} while (obj !== null);
	}

	private async _withRecursivePromise(
		uri: string,
		operation: Promise<void>
	): Promise<void> {
		const promise = await createPromise<RecursivePromiseObject>();
		const prevPromise = this._filePromises.get(uri);
		if (prevPromise) {
			prevPromise.resolve(promise);
		}
		this._filePromises.set(uri, promise);

		void operation.then(() => {
			promise.resolve(null);
		});
	}

	private async _performCheck(): Promise<void> {
		// Prep check
		const check = new PHPStanCheck(this._config);
		void log(
			this._config.connection,
			checkPrefix(check),
			'Check started for project'
		);

		const hashes: Record<string, string> = {};
		const allContents = this._config.documents.getAll();

		for (const uri in allContents) {
			const content = allContents[uri];
			hashes[uri] = basicHash(content);
		}
		this._operation = {
			check,
			hashes,
		};

		// Create statusbar operation
		const operation = this._config.statusBar.createOperation();
		await operation.start('Checking project');

		check.onProgress((progress) => {
			void operation.progress(
				progress,
				`Checking project - ${progress.done}/${progress.total} (${progress.percentage}%)`
			);
		});

		// Do check
		const config = await getConfiguration(
			this._config.connection,
			this._config.workspaceFolders
		);
		const runningCheck = withTimeout<
			ReturnResult<ReportedErrors>,
			Promise<ReturnResult<ReportedErrors>>
		>({
			promise: check.check(true),
			timeout: config.projectTimeout,
			onTimeout: async () => {
				check.dispose();
				void this._onTimeout(check);
				await operation.finish(OperationStatus.KILLED);

				return ReturnResult.killed();
			},
		});
		this._disposables.push(runningCheck);
		const result = await runningCheck.promise;

		// Show result of operation in statusbar
		await operation.finish(result.status);

		void log(
			this._config.connection,
			checkPrefix(check),
			'Check completed for project, errors=',
			JSON.stringify(this._toErrorMessageMap(result))
		);
	}

	public async checkProject(): Promise<void> {
		// Kill current running instances for this project
		if (this._operation) {
			// Different content, kill previous check and start new one
			this._operation.check.dispose();
			this._operation = null;
		}

		const invalidFile = this._config.documents.getInvalidFile();
		if (invalidFile) {
			void log(
				this._config.connection,
				MANAGER_PREFIX,
				`Not checking project because of invalid PHP file: ${invalidFile}`
			);
			return;
		}

		await this._withRecursivePromise(
			PROJECT_CHECK_STR,
			this._performCheck()
		);
		return this._getFilePromise(PROJECT_CHECK_STR);
	}

	public async checkProjectIfFileChanged(
		uri: string,
		fileContent: string | undefined
	): Promise<void> {
		if (!this._operation) {
			return this.checkProject();
		}
		if (!fileContent) {
			// Already checked if part of any operation
			return;
		}
		if (
			!this._operation.hashes[uri] ||
			this._operation.hashes[uri] === basicHash(fileContent)
		) {
			await log(
				this._config.connection,
				MANAGER_PREFIX,
				'No file changes, not checking'
			);
			return;
		}
		return this.checkProject();
	}

	public clear(): void {
		this.dispose();
		this._config.hooks.provider.clearReport();
	}

	public dispose(): void {
		this._operation?.check.dispose();
		this._operation = null;
	}
}
