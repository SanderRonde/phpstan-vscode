import type {
	QuickPickItem,
	Disposable,
	QuickInputButton,
	QuickInput,
} from 'vscode';
import { window, QuickInputButtons } from 'vscode';

export type InputStep = (input: MultiStepInput) => Thenable<InputStep | void>;

class InputFlowAction {
	private constructor() {}
	public static Back = new InputFlowAction();
	public static Cancel = new InputFlowAction();
	public static Resume = new InputFlowAction();
}

interface MultiStepInputParameters {
	title: string;
	step?: number;
	totalSteps?: number;
	ignoreFocusOut?: boolean;
	shouldResume?: () => Thenable<boolean>;
	buttons?: QuickInputButton[];
	placeholder?: string;
}

interface InputBoxParameters extends MultiStepInputParameters {
	value: string;
	prompt: string;
	password?: boolean;
	validate: (value: string) => Promise<string | undefined>;
	shouldValidateInitially?: boolean;
}

export interface QuickPickParameters<T extends QuickPickItem>
	extends MultiStepInputParameters {
	matchOnDescription?: boolean;
	matchOnDetail?: boolean;
	canPickMany?: boolean;
	items: T[];
	activeItem?: T;
}

export class MultiStepInput {
	private current?: QuickInput;
	private steps: InputStep[] = [];

	public static async run(start: InputStep): Promise<boolean> {
		const input = new MultiStepInput();
		return input.stepThrough(start);
	}

	public get currentStepNumber(): number {
		return this.steps.length;
	}

	private async stepThrough(start: InputStep): Promise<boolean> {
		let step: InputStep | void = start;
		let inputCompleted = true;
		while (step) {
			this.steps.push(step);
			if (this.current) {
				this.current.enabled = false;
				this.current.busy = true;
			}
			try {
				step = await step(this);
			} catch (err) {
				if (err === InputFlowAction.Back) {
					this.steps.pop();
					step = this.steps.pop();
				} else if (err === InputFlowAction.Resume) {
					step = this.steps.pop();
				} else if (err === InputFlowAction.Cancel) {
					step = undefined;
					inputCompleted = false;
				} else {
					throw err;
				}
			}
		}
		if (this.current) {
			this.current.dispose();
		}
		return inputCompleted;
	}

	public redoLastStep(): void {
		throw InputFlowAction.Back;
	}

	private async _showInputBox<P extends InputBoxParameters>({
		title,
		step,
		totalSteps,
		value,
		prompt,
		placeholder,
		ignoreFocusOut,
		password,
		validate,
		buttons,
		shouldResume,
		shouldValidateInitially,
	}: P): Promise<string | QuickInputButton> {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<string | QuickInputButton>(
				(resolve, reject) => {
					const input = window.createInputBox();
					input.title = title;
					input.step = step ?? this.currentStepNumber;
					input.totalSteps = totalSteps;
					input.value = value || '';
					input.prompt = prompt;
					input.placeholder = placeholder;
					input.password = !!password;
					input.ignoreFocusOut = !!ignoreFocusOut;
					input.buttons = [
						...(this.steps.length > 1
							? [QuickInputButtons.Back]
							: []),
						...(buttons || []),
					];

					if (shouldValidateInitially) {
						void (async () => {
							input.enabled = false;
							input.busy = true;
							input.validationMessage = undefined;
							const validationMessage = await validate(
								input.value
							);
							input.validationMessage = validationMessage;
							input.enabled = true;
							input.busy = false;
						})();
					}

					disposables.push(
						input.onDidTriggerButton((item) => {
							if (item === QuickInputButtons.Back) {
								reject(InputFlowAction.Back);
							} else {
								resolve(item);
							}
						}),
						input.onDidAccept(async () => {
							const value = input.value;
							input.enabled = false;
							input.busy = true;

							input.validationMessage = undefined;
							const validationMessage = await validate(value);
							input.validationMessage = validationMessage;
							if (!validationMessage) {
								resolve(value);
							}
							input.enabled = true;
							input.busy = false;
						}),
						input.onDidHide(async () => {
							try {
								reject(
									shouldResume && (await shouldResume())
										? InputFlowAction.Resume
										: InputFlowAction.Cancel
								);
							} catch (errorInShouldResume) {
								reject(errorInShouldResume);
							}
						})
					);

					if (this.current) {
						this.current.dispose();
					}
					this.current = input;
					setTimeout(() => input.show(), 5);
				}
			);
		} finally {
			disposables.forEach((d) => void d.dispose());
		}
	}

	public async showInputBox<P extends Omit<InputBoxParameters, 'buttons'>>(
		options: P
	): Promise<string> {
		return this._showInputBox(options) as Promise<string>;
	}

	public async showInputBoxWithButton<P extends InputBoxParameters>(
		options: P
	): Promise<string | NonNullable<P['buttons']>[number]> {
		return this._showInputBox(options);
	}

	public async showQuickPick<
		T extends QuickPickItem,
		P extends QuickPickParameters<T>,
	>(options: P, acceptText: true): Promise<T | string>;
	public async showQuickPick<
		T extends QuickPickItem,
		P extends QuickPickParameters<T>,
	>(options: P, acceptText?: boolean): Promise<T>;
	public async showQuickPick<
		T extends QuickPickItem,
		P extends QuickPickParameters<T>,
	>(options: P, acceptText: boolean): Promise<T>;
	public async showQuickPick<
		T extends QuickPickItem,
		P extends QuickPickParameters<T>,
	>(
		{
			title,
			step,
			totalSteps,
			items,
			activeItem,
			placeholder,
			ignoreFocusOut,
			matchOnDescription,
			matchOnDetail,
			canPickMany,
			buttons,
			shouldResume,
		}: P,
		acceptText: boolean = false
	): Promise<T | string> {
		const disposables: Disposable[] = [];
		try {
			return await new Promise<T | string>((resolve, reject) => {
				const input = window.createQuickPick<T>();
				input.title = title;
				input.step = step ?? this.currentStepNumber;
				input.totalSteps = totalSteps;
				input.placeholder = placeholder;
				input.ignoreFocusOut = !!ignoreFocusOut;
				input.matchOnDescription = !!matchOnDescription;
				input.matchOnDetail = !!matchOnDetail;
				input.canSelectMany = !!canPickMany;
				input.items = items;
				if (activeItem) {
					input.activeItems = [activeItem];
				}
				input.buttons = [
					...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
					...(buttons || []),
				];
				disposables.push(
					input.onDidTriggerButton((item) => {
						if (item === QuickInputButtons.Back) {
							reject(InputFlowAction.Back);
						} else {
							resolve(<T>item);
						}
					}),
					input.onDidAccept(() => {
						if (input.activeItems[0]) {
							resolve(input.activeItems[0]);
						} else if (acceptText) {
							resolve(input.value);
						} else {
							// Ignore
						}
					}),
					input.onDidHide(async () => {
						try {
							reject(
								shouldResume && (await shouldResume())
									? InputFlowAction.Resume
									: InputFlowAction.Cancel
							);
						} catch (errorInShouldResume) {
							reject(errorInShouldResume);
						}
					})
				);

				if (this.current) {
					this.current.dispose();
				}
				this.current = input;
				setTimeout(() => input.show(), 5);
			});
		} finally {
			disposables.forEach((d) => void d.dispose());
		}
	}
}
