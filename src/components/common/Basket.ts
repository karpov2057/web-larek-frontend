import { Component } from "../base/Component";
import { Modal } from "../common/Modal";
import { ProductsData } from "../ProductsData";
import { IProduct, IBasketItem } from "../../types";
import { IEvents } from "../base/events";
import { ensureElement, setElementData} from "../../utils/utils";
import { DeliveryAddressModal } from "./DeliveryAddressModal";
import { IOrder } from "../../types";
import { Card } from "../Card";

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

        this.basketCounter = ensureElement<HTMLElement>(".header__basket-counter");
        const basketButton = ensureElement<HTMLElement>(".header__basket");
        basketButton.addEventListener("click", this.openBasket.bind(this));

        this.selectors = {
            titleElement: ".card__title",
            priceElement: ".card__price",
            indexElement: ".basket__item-index",
            deleteButton: ".basket__item-delete",
            basketList: ".basket__list",
            basketPrice: ".basket__price"
        };

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

    private updateBasket(): void {
        this.basketCounter.textContent = String(this.items.length);
    }

    public openBasket(): void {
        const basketTpl = this.getTemplate("basket");
        const listEl = basketTpl.querySelector(".basket__list") as HTMLUListElement;
        listEl.innerHTML = "";
      
        this.items.forEach((item, idx) => {
          const li = this.getTemplate("card-basket");
          setElementData(li, { id: item.id });
      
          li.querySelector(".card__title")!.textContent = item.title;
          li.querySelector(".card__price")!.textContent =
            `${item.price!.toLocaleString("ru-RU")} синапсов`;
          li.querySelector(".basket__item-index")!.textContent = String(idx + 1);
      
          const delBtn = li.querySelector(".basket__item-delete") as HTMLButtonElement;
          delBtn.addEventListener("click", () => {
            this.items = this.items.filter(x => x.id !== item.id);
            this.openBasket();
            this.updateBasket();
          });
      
          listEl.appendChild(li);
        });
      
        const priceEl = basketTpl.querySelector(".basket__price") as HTMLElement;
        this.setText(priceEl, `${Card.formatPrice(this.calculateTotalPrice())} синапсов`);
      
        const orderBtn = basketTpl.querySelector(".basket__button") as HTMLButtonElement;
        this.setDisabled(orderBtn, this.items.length === 0);
      
        orderBtn.addEventListener("click", () => {
          if (this.items.length === 0) return;
          const orderForm = this.getTemplate("order") as HTMLFormElement;
          this.events.emit("basket:checkout", {
            formElement:  orderForm,
            parentModal: this.basketModal,
            orderData: {
              items: this.items.map(x => x.id),
              total: this.calculateTotalPrice()
            }
          });
        });
      
        this.basketModal.setContent(basketTpl);
        this.basketModal.open();
      
  
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