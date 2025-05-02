import { Modal } from "../common/Modal";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { UserInfoModal } from "./UserInfoModal";
import { IOrder } from "../../types";
import { Form } from "./Form";
import { IAddressForm } from "../../types/index";

export class DeliveryAddressModal extends Form<IAddressForm> {
    form: HTMLFormElement;
    formName: string;
    nextButton: HTMLButtonElement;
    private paymentMethod: string | null = null;
    private modal: Modal;
	  private currentOrder: Partial<IOrder & { payment: string; total: number }>;

    constructor(form: HTMLFormElement, modal: Modal, events: IEvents, orderData: Partial<IOrder & { payment: string; total: number }>) {
		super(form, events);
		this.modal = modal;
		this.formName = form.name;
		this.nextButton = ensureElement<HTMLButtonElement>(".order__button", this.container);
		this.currentOrder = orderData;

		this.initEvents();
    }

    public open(): void {
      this.modal.setContent(this.container);
      this.modal.open();
    }

  
    public close(): void {
      this.modal.close();
    }

    setPaymentMethod(method: "card" | "cash"): void {
        this.paymentMethod = method;
    
        const buttons = this.container.querySelectorAll(".button_alt");
        buttons.forEach((button) => this.toggleClass(button as HTMLElement, "button_alt-active", false)
        );
    
        const selectedButton = this.container.querySelector<HTMLButtonElement>(`.button_alt[name="${method}"]`);
        if (selectedButton) {
            this.toggleClass(selectedButton, "button_alt-active", true);
        }
    
        this.updateNextButtonState();
    }

    validateForm(): boolean {
        const addressInput = this.container.querySelector<HTMLInputElement>('input[name="address"]');
        const addressValue = addressInput?.value.trim();

        return !!addressValue && !!this.paymentMethod;
    }

    private updateNextButtonState(): void {
        if (this.validateForm()) {
            this.nextButton.disabled = false;
        } else {
            this.nextButton.disabled = true;
        }
    }

    private initEvents(): void {
        const addressInput = this.container.querySelector<HTMLInputElement>('input[name="address"]');
        if (addressInput) {
          addressInput.addEventListener("input", () => this.updateNextButtonState());
        }
      
        const paymentButtons = this.container.querySelectorAll<HTMLButtonElement>(".button_alt");
        paymentButtons.forEach((button) =>
          button.addEventListener("click", () => {
            const method = button.name as "card" | "cash";
            this.setPaymentMethod(method);
          })
        );
      
        this.events.on(`${this.formName}:submit`, () => {
          if (!this.validateForm()) return;
    
          const address = (this.container.querySelector('input[name="address"]') as HTMLInputElement).value.trim();
          this.currentOrder.address = address;
          this.currentOrder.payment = this.paymentMethod!;
    
          this.modal.close();
    
          const contactsTemplate = document.getElementById("contacts") as HTMLTemplateElement;
          const contactsForm = contactsTemplate.content.firstElementChild!.cloneNode(true) as HTMLFormElement;
    
          this.events.emit('delivery:submitted', {
            formElement: contactsForm,
            parentModal: this.modal,
            orderData: this.currentOrder,
          });
        });
      }
}