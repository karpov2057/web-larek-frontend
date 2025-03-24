import { Modal } from "./Modal";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { IOrder } from "../../types";

export class UserInfoModal extends Modal {
	form: HTMLFormElement;
	formName: string;
	paymentButton: HTMLButtonElement;
	private modal: Modal;
	private currentOrder: Partial<IOrder & { payment: string; total: number }>;

	constructor(form: HTMLFormElement, events: IEvents, modal: Modal, orderData: Partial<IOrder & { payment: string; total: number }>) {
		super(form.closest(".modal") as HTMLElement, events);

		this.form = form;
		this.formName = form.name;
		this.paymentButton = ensureElement<HTMLButtonElement>('button[type="submit"]', form);
		this.modal = modal;
		this.currentOrder = orderData;

		this.initEvents();
	}

	validateForm(): boolean {
		const emailInput = this.form.querySelector<HTMLInputElement>('input[name="email"]');
		const phoneInput = this.form.querySelector<HTMLInputElement>('input[name="phone"]');
		return Boolean(emailInput?.value.trim() && phoneInput?.value.trim());
	}

	private initEvents(): void {
		const emailInput = this.form.querySelector<HTMLInputElement>('input[name="email"]');
		const phoneInput = this.form.querySelector<HTMLInputElement>('input[name="phone"]');

		[emailInput, phoneInput].forEach(input => {
			input?.addEventListener("input", () => {
				this.paymentButton.disabled = !this.validateForm();
			});
		});

		this.form.addEventListener("submit", (event) => {
			event.preventDefault();
			if (this.validateForm()) {
                const email = (this.form.querySelector('input[name="email"]') as HTMLInputElement).value.trim();
                const phone = (this.form.querySelector('input[name="phone"]') as HTMLInputElement).value.trim();
        
                this.currentOrder.email = email;
                this.currentOrder.phone = phone;
        
                this.close();
        
                this.events.emit("order:submit", this.currentOrder);
            }
		});
	}
}
