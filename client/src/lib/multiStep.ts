import { QuickInputButtons, window } from 'vscode';
import type { Disposable, InputBox } from 'vscode';

type GettableValue = string | ((stepper: MultiStepper) => string);

export class MultiStepEntry {
	public constructor(
		public settings: {
			placeHolder?: GettableValue;
			prompt?: GettableValue;
			value?: GettableValue;
			validate?: (
				value: string,
				stepper: MultiStepper
			) => Promise<{
				isValid: boolean;
				message?: string;
			}>;
			isPassword?: boolean;
		}
	) {}

	public static getGettable(
		stepper: MultiStepper,
		gettableValue?: GettableValue
	): string | undefined {
		if (!gettableValue) {
			return gettableValue;
		}
		if (typeof gettableValue === 'string') {
			return gettableValue;
		}

		return gettableValue(stepper);
	}

	public setInputSettings(stepper: MultiStepper, input: InputBox): void {
		input.placeholder = MultiStepEntry.getGettable(
			stepper,
			this.settings.placeHolder
		);
		input.prompt = MultiStepEntry.getGettable(
			stepper,
			this.settings.prompt
		);
		input.value =
			MultiStepEntry.getGettable(stepper, this.settings.value)! ?? '';
		input.password = !!this.settings.isPassword;
	}

	public async validate(
		stepper: MultiStepper,
		input: InputBox,
		value: string
	): Promise<boolean> {
		if (!this.settings.validate) {
			return true;
		}

		input.enabled = false;
		input.busy = true;
		input.show();

		const result = await this.settings.validate(value, stepper);

		input.enabled = true;
		input.busy = false;
		input.show();

		if (result.isValid) {
			input.validationMessage = undefined;
			input.show();
			return true;
		}

		input.validationMessage = result.message;
		input.show();
		return false;
	}
}

export class MultiStepper {
	private _currentStepIndex = 0;
	private _disposables: Disposable[] = [];
	private _values: (string | undefined)[] = [];
	private _runPromise: Promise<(string | undefined)[] | undefined> | null =
		null;
	private _resolveRunPromise:
		| null
		| ((value: (string | undefined)[] | undefined) => void) = null;

	private get _currentStep(): MultiStepEntry {
		return this._steps[this._currentStepIndex];
	}

	public get values(): (string | undefined)[] {
		return this._values;
	}

	public constructor(private readonly _steps: MultiStepEntry[]) {
		this._values = this._steps.map((step) => {
			return (
				MultiStepEntry.getGettable(this, step.settings.value) ??
				undefined
			);
		});
	}

	private _runStep(input: InputBox, stepIndex: number): void {
		this._currentStepIndex = stepIndex;
		const step = this._currentStep;
		input.step = stepIndex + 1;
		step.setInputSettings(this, input);
		input.buttons = stepIndex > 0 ? [QuickInputButtons.Back] : [];
	}

	private _prevStep(input: InputBox): void {
		this._runStep(input, this._currentStepIndex - 1);
	}

	private _nextStep(input: InputBox): void {
		if (this._currentStepIndex + 1 < this._steps.length) {
			this._runStep(input, this._currentStepIndex + 1);
		} else {
			// Done :)
			input.hide();
			this.dispose();
			this._resolveRunPromise?.(this._values);
		}
	}

	public run(
		input = window.createInputBox()
	): Promise<undefined | (string | undefined)[]> {
		this._runPromise = new Promise((resolve) => {
			this._resolveRunPromise = resolve;
		});

		input.totalSteps = this._steps.length;
		input.ignoreFocusOut = true;
		this._disposables.push(
			input.onDidTriggerButton((e) => {
				if (e === QuickInputButtons.Back) {
					this._prevStep(input);
				}
			})
		);
		this._disposables.push(
			input.onDidHide(() => {
				this.dispose();
				this._resolveRunPromise?.(undefined);
			})
		);
		this._disposables.push(
			input.onDidAccept(async () => {
				if (
					await this._currentStep.validate(this, input, input.value)
				) {
					this._values[this._currentStepIndex] = input.value;
					this._nextStep(input);
				}
			})
		);
		this._disposables.push(input);

		this._runStep(input, 0);
		input.show();

		return this._runPromise;
	}

	public dispose(): void {
		this._disposables.forEach((d) => void d.dispose());
	}
}
