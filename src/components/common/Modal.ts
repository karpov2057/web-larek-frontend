import {Component} from "../base/Component";
import {ensureElement} from "../../utils/utils";
import {IEvents} from "../base/events";


export class Modal extends Component<any> {
    private _closeButton: HTMLButtonElement;
    private _content: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>(".modal__close", container);
        this._content = ensureElement<HTMLElement>(".modal__content", container);

        this._closeButton.addEventListener("click", this.close.bind(this));

        this.container.addEventListener("click", this.close.bind(this));

        this._content.addEventListener("click", (event) => event.stopPropagation());

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && this.isOpen()) {
                this.close();
            }
        });
    }
    
    setContent(value: HTMLElement | null): void {
        if (!value) return;
        this._content.replaceChildren(value);
    }

    open(): void {
        this.toggleClass(this.container, "modal_active", true);
        this.events.emit("modal:open");
    }

    close(): void {
        this.container.classList.remove("modal_active");
        this.setContent(null);
        this.events.emit("modal:close");
    }

    isOpen(): boolean {
        return this.container.classList.contains("modal_active");
    }
}