import { Component } from "./base/Component";
import { ProductsData } from "./ProductsData";
import { IProductAPI } from "./ProductAPI";
import { IProduct } from "../types";
import { Modal } from "./common/Modal";
import { IEvents } from "./base/events";
import { Basket } from "../../src/components/common/Basket";


export class ProductList extends Component<IProduct[]> {
    private productsData: ProductsData;
    private api: IProductAPI;
    private modal: Modal;
    private events: IEvents;
    private basket: Basket;

    constructor(container: HTMLElement, productsData: ProductsData, api: IProductAPI, modal: Modal, events: IEvents, basket: Basket) {
        super(container);
        this.productsData = productsData;
        this.api = api;
        this.modal = modal;
        this.events = events;
        this.basket = basket;
        

        // Подписка на изменения данных о продуктах
        this.productsData.subscribeToProducts(this.renderProducts.bind(this));

        this.events.on<IProduct>("basket:productAdded", (product) => {
            const modalButton = document.querySelector(`#modal-container .card__button`) as HTMLButtonElement;
            if (modalButton) {
                modalButton.disabled = true;
            }
        });
    }

    /**
     * Отрисовка списка продуктов
     * @param products Текущий массив продуктов
     */
    private renderProducts(products: IProduct[]): void {
        this.container.innerHTML = ""; // Очищаем контейнер

        products.forEach((product) => {
            const productElement = this.createProductItem(product);
            this.container.appendChild(productElement);
        });
    }

    /**
     * Создание карточки товара
     * @param product Текущий продукт
     */
    private createProductItem(product: IProduct): HTMLElement {
        const productCard = this.getTemplate("card-catalog");

        // Устанавливаем данные в карточку
        const categoryElement = productCard.querySelector(".card__category") as HTMLElement;
        const priceElement = productCard.querySelector(".card__price") as HTMLElement;
        const imageElement = productCard.querySelector(".card__image") as HTMLImageElement;
        const titleElement = productCard.querySelector(".card__title") as HTMLElement;

        titleElement.textContent = product.title;
        categoryElement.textContent = product.category;
        this.setCategoryColor(categoryElement, product.category);

        if (product.price === null) {
            this.setText(priceElement, "Бесценно");
        } else {
            this.setText(priceElement, `${this.formatPrice(product.price)} синапсов`);
        }

        this.setImage(imageElement, product.image);

        // Событие на открытие модального окна
        productCard.addEventListener("click", () => this.showProductInModal(product));
        return productCard;
    }

    /**
     * Открывает продукт в модальном окне
     * @param product Текущий продукт
     */
    private showProductInModal(product: IProduct): void {
        const productPreview = this.getTemplate("card-preview");
        
        // Подготовка заполнения карточки
        const categoryElement = productPreview.querySelector(".card__category") as HTMLElement;
        const priceElement = productPreview.querySelector(".card__price") as HTMLElement;
        const imageElement = productPreview.querySelector(".card__image") as HTMLImageElement;
        const titleElement = productPreview.querySelector(".card__title") as HTMLElement;
        const addToBasketButton = productPreview.querySelector(".card__button") as HTMLButtonElement;
    
        titleElement.textContent = product.title;
        categoryElement.textContent = product.category;
        this.setCategoryColor(categoryElement, product.category);
    
        if (product.price === null) {
            this.setText(priceElement, "Бесценно");
            this.setDisabled(addToBasketButton, true);
        } else {
            this.setText(priceElement, `${this.formatPrice(product.price)} синапсов`);
            this.setDisabled(addToBasketButton, false);
        }
    
        this.setImage(imageElement, product.image);
    
        // Проверяем, добавлен ли продукт в корзину
        const isInBasket = this.basket.isProductInBasket(product.id);
            if (isInBasket) {
                 this.setText(addToBasketButton, "Товар в корзине");
                 this.setDisabled(addToBasketButton, true);
            }
    
        // Событие "Добавить в корзину"
        addToBasketButton.addEventListener("click", () => {
            this.events.emit("basket:addProduct", product);
            this.setText(addToBasketButton, "Товар в корзине");
            this.setDisabled(addToBasketButton, true);
        });
    
        // Модальное окно
        this.modal.setContent(productPreview); // Устанавливаем содержимое один раз
        this.modal.open();
    }
}