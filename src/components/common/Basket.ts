import { Component } from "../base/Component";
import { Modal } from "../common/Modal";
import { ProductsData } from "../ProductsData";
import { IProduct, IBasketItem } from "../../types";
import { IEvents } from "../base/events";
import { ensureElement, setElementData} from "../../utils/utils";
import { DeliveryAddressModal } from "./DeliveryAddressModal";
import { IOrder } from "../../types";

export class Basket extends Component<IProduct[]> {
    private items: IProduct[] = [];
    private basketModal: Modal;
    private productsData: ProductsData;
    private events: IEvents;
    private basketCounter: HTMLElement;
    private templates: {
        basketTemplate: HTMLElement;
        itemTemplate: HTMLElement;
    };

    private selectors: {
        titleElement: string;
        priceElement: string;
        indexElement: string;
        deleteButton: string;
        basketList: string;
        basketPrice: string;
    };

    constructor(
        container: HTMLElement,
        basketModal: Modal,
        productsData: ProductsData,
        events: IEvents
    ) {
        super(container);

        this.basketModal = basketModal;
        this.productsData = productsData;
        this.events = events;

        // Ищем статические элементы
        this.basketCounter = ensureElement<HTMLElement>(".header__basket-counter");
        const basketButton = ensureElement<HTMLElement>(".header__basket");
        basketButton.addEventListener("click", this.openBasket.bind(this));

        // Инициализируем шаблоны
        this.templates = {
            basketTemplate: this.getTemplate("basket"),
            itemTemplate: this.getTemplate("card-basket")
        };

        // Сохраняем селекторы, которые будем многократно использовать
        this.selectors = {
            titleElement: ".card__title",
            priceElement: ".card__price",
            indexElement: ".basket__item-index",
            deleteButton: ".basket__item-delete",
            basketList: ".basket__list",
            basketPrice: ".basket__price"
        };

        // Подписываемся на события
        this.events.on<IBasketItem[]>("basket:updated", this.renderBasket.bind(this));
        this.events.on<IProduct>("basket:addProduct", (product: IProduct) => {
            this.addProduct(product);
        });
    }

    addProduct(product: IProduct): void {
        if (product.price === null) {
            console.error("Бесценный товар нельзя добавить в корзину");
            return;
        }

        const existingItem = this.items.find((item) => item.id === product.id);
        if (existingItem) {
            console.warn("Товар уже в корзине");
            return;
        }

        this.items.push({ ...product });
        this.updateBasket();

        // Обновляем состояние кнопки в модальном окне через событие
        this.events.emit("basket:productAdded", product);
    }

    removeProduct(productId: string): void {
        this.items = this.items.filter((item) => item.id !== productId);
        this.updateBasket();
        this.renderBasket();
    }

    isProductInBasket(productId: string): boolean {
        return this.items.some((item) => item.id === productId);
    }

    private calculateTotalPrice(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    private updateTotalPrice(): void {
        const totalPrice = this.calculateTotalPrice();
        const basketPriceElement = this.templates.basketTemplate.querySelector(
            this.selectors.basketPrice
        ) as HTMLElement;

        if (basketPriceElement) {
            basketPriceElement.textContent = `${this.formatPrice(totalPrice)} синапсов`;
        }
    }

    private updateBasket(): void {
        this.basketCounter.textContent = String(this.items.length);
    }

    openBasket(): void {
        const basketList = this.templates.basketTemplate.querySelector(
            this.selectors.basketList
        ) as HTMLUListElement;

        basketList.innerHTML = "";

        this.items.forEach((item, index) => {
            const itemTemplate = this.templates.itemTemplate.cloneNode(
                true
            ) as HTMLElement;

            setElementData(itemTemplate, { id: item.id });

            const titleElement = itemTemplate.querySelector(this.selectors.titleElement) as HTMLElement;
            const priceElement = itemTemplate.querySelector(this.selectors.priceElement) as HTMLElement;
            const indexElement = itemTemplate.querySelector(this.selectors.indexElement) as HTMLElement;

            titleElement.textContent = item.title;
            priceElement.textContent = `${item.price!.toLocaleString("ru-RU")} синапсов`;
            indexElement.textContent = String(index + 1);

            const deleteButton = itemTemplate.querySelector(
                this.selectors.deleteButton
            ) as HTMLButtonElement;
            deleteButton.addEventListener("click", () =>
                this.removeProduct(item.id)
            );

            basketList.appendChild(itemTemplate);
        });

        this.updateTotalPrice();
        this.basketModal.setContent(this.templates.basketTemplate);
        this.basketModal.open();

        const orderButton = this.templates.basketTemplate.querySelector('.basket__button') as HTMLButtonElement;
          if (orderButton) {
            orderButton.addEventListener('click', () => {
              try {
                  const orderElement = this.getTemplate('order') as HTMLFormElement;

                   // Сначала помещаем форму в модалку
                this.basketModal.setContent(orderElement);

                const currentOrderData: Partial<IOrder & { payment: string; total: number }> = {
                    items: this.items.map((item) => item.id),
                    total: this.calculateTotalPrice()
                };

                 // Теперь создаём модалку адреса доставки
                 const deliveryModal = new DeliveryAddressModal(orderElement, this.basketModal, this.events, currentOrderData);
                  deliveryModal.open();

        } catch (error) {
            console.error("Ошибка при открытии формы доставки:", error);
        }
    });

    }
}

    clear(): void {
	  this.items = [];
	  this.updateBasket();
    }

    private renderBasket(): void {
        if (this.basketModal.isOpen()) {
            this.openBasket();
        }
    }
}