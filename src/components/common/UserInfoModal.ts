import { Form } from "./Form";
import { Modal } from "../common/Modal";
import { IEvents } from "../base/events";
import { IOrder, IUserInfoForm } from "../../types";
import { ensureElement } from "../../utils/utils";

export class UserInfoModal extends Form<IUserInfoForm> {
  private modal: Modal;
  private orderData: Partial<IOrder & { payment: string; total: number }>;
  private submitButton: HTMLButtonElement;

  constructor(
    form: HTMLFormElement,
    events: IEvents,
    parentModal: Modal,
    orderData: Partial<IOrder & { payment: string; total: number }>
  ) {
    super(form, events);
    this.modal = parentModal;
    this.orderData = orderData;
    this.submitButton = ensureElement<HTMLButtonElement>("button[type=submit]", this.container);
    this.initEvents();
  }

  public open(): void {
    this.modal.setContent(this.container);
    this.modal.open();
  }

  private validateForm(): boolean {
    const emailInput = this.container.querySelector<HTMLInputElement>("input[name='email']");
    const phoneInput = this.container.querySelector<HTMLInputElement>("input[name='phone']");
    return !!(emailInput?.value.trim() && phoneInput?.value.trim());
  }

  private updateSubmitButton(): void {
    this.submitButton.disabled = !this.validateForm();
  }

  private initEvents(): void {
    const emailInput = this.container.querySelector<HTMLInputElement>("input[name='email']");
    const phoneInput = this.container.querySelector<HTMLInputElement>("input[name='phone']");

    emailInput?.addEventListener("input", () => this.updateSubmitButton());
    phoneInput?.addEventListener("input", () => this.updateSubmitButton());

    this.events.on(`${this.container.name}:submit`, () => {
        if (!this.validateForm()) return;

        const email = (this.container.querySelector("input[name='email']") as HTMLInputElement).value.trim();
        const phone = (this.container.querySelector("input[name='phone']") as HTMLInputElement).value.trim();

        Object.assign(this.orderData, { email, phone });
        this.modal.close();

        this.events.emit("order:confirm", this.orderData as IOrder & { payment: string; total: number }
        );
      }
    );
  }
}
