import { OperationStatus } from '../../../shared/statusBar';

export class ReturnResult<R, E = void> {
	protected constructor(
		public status: OperationStatus,
		public value: R | null,
		public error: E | null = null
	) {}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public static success<R>(result: R): ReturnResult<R, any> {
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
	public static error<E>(error?: E): ReturnResult<any, E> {
		return new ReturnResult(OperationStatus.ERROR, null, error);
	}

	public success(): this is SuccessReturnResult<R> {
		return this.status === OperationStatus.SUCCESS;
	}

	public chain<N>(operation: (data: R) => N): ReturnResult<N, void> {
		if (!this.success()) {
			return this as unknown as ReturnResult<N>;
		}
		return ReturnResult.success(operation(this.value)) as ReturnResult<N>;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	public cast(): ReturnResult<any, any> {
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
