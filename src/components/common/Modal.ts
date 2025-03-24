import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";
import {IEvents} from "../base/events";


export class Modal extends Component<any> {
    private _closeButton: HTMLButtonElement;
    private _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        // Ищем элементы модального окна
        this._closeButton = ensureElement<HTMLButtonElement>(".modal__close", container);
        this._content = ensureElement<HTMLElement>(".modal__content", container);

        // Закрытие по кнопке
        this._closeButton.addEventListener("click", this.close.bind(this));

        // Закрытие по клику на оверлей
        this.container.addEventListener("click", this.close.bind(this));

        // Остановка обработки события клика на контенте
        this._content.addEventListener("click", (event) => event.stopPropagation());

        // Закрытие по клавише Esc
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.isOpen()) {
                this.close();
            }
        });
    }

    /**
     * Метод установки контента
     * @param value Динамический контент для вставки
     */
    setContent(value: HTMLElement | null): void {
        if (!value) return; // Очищать контент напрямую мы не будем, только при закрытии
        this._content.replaceChildren(value);
    }

    /**
     * Метод открытия модального окна
     */
    open(): void {
        this.container.classList.add("modal_active");
        this.events.emit("modal:open");
    }

    /**
     * Метод закрытия модального окна
     */
    close(): void {
        this.container.classList.remove("modal_active");
        this.setContent(null); // Очищаем контент при закрытии
        this.events.emit("modal:close");
    }

    /**
     * Проверяем активность модального окна
     */
    isOpen(): boolean {
        return this.container.classList.contains("modal_active");
    }
}