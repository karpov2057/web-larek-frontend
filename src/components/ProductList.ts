import { Component } from "./base/Component";
import { ProductsData } from "./ProductsData";
import { IProductAPI } from "./ProductAPI";
import { IProduct } from "../types";
import { Modal } from "./common/Modal";
import { IEvents } from "./base/events";
import { Basket } from "../../src/components/common/Basket";
import { Card } from "./Card";


export class ProductList extends Component<IProduct[]> {
    constructor(
        container: HTMLElement,
        private productsData: ProductsData,
        private api: IProductAPI,
        private modal: Modal,
        private events: IEvents,
        private basket: Basket
    ) {
        super(container);
        this.productsData.subscribeToProducts(this.renderProducts.bind(this));
        this.events.on<IProduct>("basket:productAdded", product => {
            const button = document.querySelector(`#modal-container .card__button`) as HTMLButtonElement;
            if (button) button.disabled = true;
        });
    }

    private renderProducts(products: IProduct[]) {
        this.container.innerHTML = "";
        products.forEach(product => {
            const element = Card.createCatalog(product, () => this.showProductInModal(product));
            this.container.appendChild(element);
        });
    }

    private showProductInModal(product: IProduct) {
        const element = Card.createPreview(product, e => {
            this.events.emit("basket:addProduct", product);
            (e.currentTarget as HTMLButtonElement).disabled = true;
            (e.currentTarget as HTMLButtonElement).textContent = "Товар в корзине";
        });

        if (this.basket.isProductInBasket(product.id)) {
            const button = element.querySelector(".card__button") as HTMLButtonElement;
            if (button) {
                button.disabled = true;
                button.textContent = "Товар в корзине";
            }
        }

        this.modal.setContent(element);
        this.modal.open();
    }
}