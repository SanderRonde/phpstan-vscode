import type { Disposable, Diagnostic } from 'vscode-languageserver';
import { OperationStatus } from '../../../../shared/statusBar';
import type { PartialDocument } from './runner';
import type { ClassConfig } from './manager';
import type { ReturnResult } from './result';
import { PHPStanRunner } from './runner';

export class PHPStanCheck implements Disposable {
	private _disposables: Disposable[] = [];

	public constructor(private readonly _config: ClassConfig) {}

	public async check(
		e: PartialDocument,
		dirty: boolean
	): Promise<ReturnResult<Diagnostic[]>> {
		const runner = new PHPStanRunner(this._config);
		const errorManager = new PHPStanCheckErrorManager(this._config);
		this._disposables.push(runner);

		const result = await runner.check(e, dirty);
		await errorManager.handleResult(e, result);

		this.dispose();

		return result;
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
		this._disposables = [];
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
