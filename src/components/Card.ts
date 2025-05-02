import { Component } from "../components/base/Component";
import { IProduct } from "../types";
import { ensureElement } from "../utils/utils";

interface ICardActions {
    onClick?: (event: MouseEvent) => void;
}

export class Card extends Component<IProduct> {
    private category: HTMLElement;
    private title: HTMLElement;
    private image: HTMLImageElement;
    private price: HTMLElement;
    private description?: HTMLElement;
    private button?: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this.category = ensureElement<HTMLElement>(".card__category", container);
        this.title = ensureElement<HTMLElement>(".card__title", container);
        this.image = ensureElement<HTMLImageElement>(".card__image", container);
        this.price = ensureElement<HTMLElement>(".card__price", container);
        this.description = container.querySelector<HTMLElement>(".card__text") || undefined;
        this.button = container.querySelector<HTMLButtonElement>(".card__button") || undefined;

        if (actions?.onClick) {
            const target = this.button ?? this.container;
            target.addEventListener("click", actions.onClick);
        }
    }

    private setCategoryColor(element: HTMLElement, category: string) {
        const map: Record<string,string> = {
            "софт-скил":    "card__category_soft",
            "другое":       "card__category_other",
            "дополнительное":"card__category_additional",
            "кнопка":       "card__category_button",
            "хард-скил":    "card__category_hard",
        };
        Object.values(map).forEach(cls => this.toggleClass(element, className, false));
        const className = map[category];
        if (className) this.toggleClass(element, className, true);
    }

    private formatPrice(value: number): string {
        return value >= 10000 ? value.toLocaleString("ru-RU") : value.toString();
    }

    public setData(product: IProduct) {
        this.container.dataset.id = product.id;
        this.setText(this.title, product.title);
        this.setImage(this.image, product.image, product.title);
        this.setText(this.category, product.category);
        this.setCategoryColor(this.category, product.category);
        if (product.price <= 0) {
            this.setText(this.price, "Бесценно");
            if (this.button) this.setDisabled(this.button, true);
        } else {
            this.setText(this.price, `${this.formatPrice(product.price)} синапсов`);
            if (this.button) this.setDisabled(this.button, false);
        }
        if (this.description && product.description) {
            this.setText(this.description, product.description);
        }
    }

    static createCatalog(product: IProduct, onClick: () => void): HTMLElement {
        const template = document.getElementById("card-catalog") as HTMLTemplateElement;
        if (!template) throw new Error('Template "card-catalog" not found');
        const element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const card = new Card(element, { onClick });
        card.setData(product);
        return element;
    }

    static createPreview(product: IProduct, onAdd: (event:MouseEvent)=>void): HTMLElement {
        const template = document.getElementById("card-preview") as HTMLTemplateElement;
        if (!template) throw new Error('Template "card-preview" not found');
        const element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        const card = new Card(element, { onClick: onAdd });
        card.setData(product);
        return element;
    }

    static formatPrice(value: number): string {
        return value >= 10000 ? value.toLocaleString("ru-RU") : value.toString();
    }
}