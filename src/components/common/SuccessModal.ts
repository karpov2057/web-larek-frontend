import { Modal } from "./Modal";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

export class SuccessModal extends Modal {
	private template: HTMLElement;

 constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    const template = document.getElementById("success") as HTMLTemplateElement;
    this.template = template.content.firstElementChild!
      .cloneNode(true) as HTMLElement;
  }

  public open(): void {
    this.setContent(this.template);

    const closeButton = ensureElement<HTMLButtonElement>(".order-success__close", this.container);
    closeButton.addEventListener("click", () => this.close());

    super.open();
  }

  public setTotal(amount: number) {
	const desc = this.container.querySelector(".order-success__description");
    if (desc) {
      desc.textContent = `Списано ${amount} синапсов`;
    }
  }
}