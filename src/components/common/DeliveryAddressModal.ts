import { Modal } from "../common/Modal";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { UserInfoModal } from "./UserInfoModal";
import { IOrder } from "../../types";

export class DeliveryAddressModal extends Modal {
    form: HTMLFormElement;
    formName: string;
    nextButton: HTMLButtonElement;
    private paymentMethod: string | null = null;
    private modal: Modal;
	private currentOrder: Partial<IOrder & { payment: string; total: number }>;

    constructor(form: HTMLFormElement, modal: Modal, events: IEvents, orderData: Partial<IOrder & { payment: string; total: number }>) {
		super(form.closest(".modal") as HTMLElement, events);

		this.form = form;
		this.modal = modal;
		this.events = events;
		this.formName = form.name;
		this.nextButton = ensureElement<HTMLButtonElement>(".order__button", this.form);
		this.currentOrder = orderData;

		this.initEvents();
    }

    /**
     * Устанавливает выбранный способ оплаты
     */
    setPaymentMethod(method: "card" | "cash"): void {
        this.paymentMethod = method;

        // Удаляем активный класс у всех кнопок
        const buttons = this.form.querySelectorAll(".button_alt");
        buttons.forEach((button) => button.classList.remove("button_alt-active"));

        // Добавляем активный класс на выбранную кнопку
        const selectedButton = this.form.querySelector<HTMLButtonElement>(`.button_alt[name="${method}"]`);
        if (selectedButton) {
            selectedButton.classList.add("button_alt-active");
        }

        // Проверяем валидацию формы после выбора способа оплаты
        this.updateNextButtonState();
    }

    /**
     * Проверяет корректность заполнения формы
     */
    validateForm(): boolean {
        const addressInput = this.form.querySelector<HTMLInputElement>('input[name="address"]');
        const addressValue = addressInput?.value.trim();

        // Проверка: адрес введен и способ оплаты выбран
        return !!addressValue && !!this.paymentMethod;
    }

    /**
     * Обновляет состояние кнопки "Далее" в зависимости от валидации формы
     */
    private updateNextButtonState(): void {
        if (this.validateForm()) {
            this.nextButton.disabled = false;
        } else {
            this.nextButton.disabled = true;
        }
    }

    /**
     * Инициализация событий формы
     */
    private initEvents(): void {
        // Обработчик ввода в поле адреса доставки
        const addressInput = this.form.querySelector<HTMLInputElement>('input[name="address"]');
        if (addressInput) {
            addressInput.addEventListener("input", () => this.updateNextButtonState());
        }

        // Обработчики кнопок выбора оплаты
        const paymentButtons = this.form.querySelectorAll<HTMLButtonElement>(".button_alt");
        paymentButtons.forEach((button) =>
            button.addEventListener("click", () => {
                const method = button.name as "card" | "cash";
                this.setPaymentMethod(method);
            })
        );

        // Обработка отправки формы
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
        
            if (this.validateForm()) {
                const address = (this.form.querySelector('input[name="address"]') as HTMLInputElement).value.trim();
                this.currentOrder.address = address;
                this.currentOrder.payment = this.paymentMethod!;
        
                this.close();
        
                // Переход ко второму шагу
                const contactsTemplate = document.getElementById("contacts") as HTMLTemplateElement;
                const contactsForm = contactsTemplate.content.firstElementChild.cloneNode(true) as HTMLFormElement;
        
                this.modal.setContent(contactsForm);
        
                // создаём UserInfoModal
                const userInfoModal = new UserInfoModal(contactsForm, this.events, this.modal, this.currentOrder);
                userInfoModal.open();
            }
        });
    }
}