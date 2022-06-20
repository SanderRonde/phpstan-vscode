import type { Disposable, Diagnostic } from 'vscode-languageserver';
import { OperationStatus } from '../../../../shared/statusBar';
import type { PartialDocument } from './runner';
import type { ClassConfig } from './manager';
import { PHPStanRunner } from './runner';
import { ReturnResult } from './result';

export class PHPStanCheck implements Disposable {
	private _disposables: Disposable[] = [];
	private _done: boolean = false;
	private _disposed: boolean = false;

	public get done(): boolean {
		return this._done;
	}

	public constructor(private readonly _config: ClassConfig) {}

	public async check(
		e: PartialDocument,
		applyErrors: boolean
	): Promise<ReturnResult<Diagnostic[]>> {
		if (this._disposed) {
			return ReturnResult.canceled();
		}
		const runner = new PHPStanRunner(this._config);
		const errorManager = new PHPStanCheckErrorManager(this._config);
		this._disposables.push(runner);

		const result = await runner.check(e);
		if (applyErrors) {
			await errorManager.handleResult(e, result);
		}

		this.dispose();
		this._done = true;

		return result;
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
		this._disposed = true;
	}
}

class PHPStanCheckErrorManager {
	public constructor(private readonly _config: ClassConfig) {}

	private _showErrors(
		doc: PartialDocument,
		errors: Diagnostic[]
	): Promise<void> {
		return this._config.connection.sendDiagnostics({
			uri: doc.uri,
			diagnostics: errors,
		});
	}

	private _clearErrors(e: PartialDocument): Promise<void> {
		return this._config.connection.sendDiagnostics({
			uri: e.uri,
			diagnostics: [],
		});
	}

	public async handleResult(
		doc: PartialDocument,
		result: ReturnResult<Diagnostic[]>
	): Promise<void> {
		if (result.success()) {
			await this._showErrors(doc, result.value);
		} else if (result.status === OperationStatus.ERROR) {
			await this._clearErrors(doc);
		}
	}
}
