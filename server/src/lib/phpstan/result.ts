import { OperationStatus } from '../../../../shared/statusBar';

export class ReturnResult<R> {
	protected constructor(
		public status: OperationStatus,
		public value: R | null
	) {}

	public static success<R>(result: R): ReturnResult<R> {
		return new ReturnResult(OperationStatus.SUCCESS, result);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static killed(): ReturnResult<any> {
		return new ReturnResult(OperationStatus.KILLED, null);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static canceled(): ReturnResult<any> {
		return new ReturnResult(OperationStatus.CANCELED, null);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static error(): ReturnResult<any> {
		return new ReturnResult(OperationStatus.ERROR, null);
	}

	public success(): this is SuccessReturnResult<R> {
		return this.status === OperationStatus.SUCCESS;
	}

	public chain<N>(operation: (data: R) => N): ReturnResult<N> {
		if (!this.success()) {
			return this as unknown as ReturnResult<N>;
		}
		return ReturnResult.success(operation(this.value));
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public cast(): ReturnResult<any> {
		return this;
	}
}

class SuccessReturnResult<R> extends ReturnResult<R> {
	protected constructor(
		public override status: OperationStatus.SUCCESS,
		public override value: R
	) {
		super(status, value);
	}
}
