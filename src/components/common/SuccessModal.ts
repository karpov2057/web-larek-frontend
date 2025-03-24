import { Modal } from "./Modal";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

export class SuccessModal extends Modal {
	constructor(container: HTMLElement, events: IEvents) {
		super(container, events); // передаём events

		const closeButton = ensureElement<HTMLButtonElement>(".order-success__close", container);

		closeButton.addEventListener("click", () => {
			this.close();
		});
	}

	setTotal(amount: number) {
		const desc = this.container.querySelector(".order-success__description");
		if (desc) {
			desc.textContent = `Списано ${amount} синапсов`;
		}
	}
}