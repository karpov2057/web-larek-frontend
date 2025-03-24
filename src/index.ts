import './scss/styles.scss';

import { cloneTemplate, ensureElement } from './utils/utils';

import { IOrderForm, IOrder } from './types';

import { EventEmitter } from './components/base/events';
import { ProductAPI } from './components/ProductAPI';
import { ProductsData } from './components/ProductsData';
import { ProductList } from './components/ProductList';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Order } from './components/Order';
import { DeliveryAddressModal } from './components/common/DeliveryAddressModal';
import { UserInfoModal } from './components/common/UserInfoModal';
import { SuccessModal } from './components/common/SuccessModal';

import { API_URL, CDN_URL } from './utils/constants';

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

const modalContainer = ensureElement<HTMLElement>("#modal-container");
const modal = new Modal(modalContainer, events);

const productsData = new ProductsData(events);
const basketCounter = ensureElement<HTMLElement>(".header__basket-counter");
const basket = new Basket(basketCounter, modal, productsData, events);

const galleryContainer = ensureElement<HTMLElement>(".gallery");
const productList = new ProductList(galleryContainer, productsData, api, modal, events, basket);

const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const order = new Order(cloneTemplate(orderTemplate), events);

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	order.valid = !email && !phone;
	order.errors = Object.values({ phone, email }).filter(Boolean).join('; ');
});

events.on("order:submit", (order: IOrder & { payment: string; total: number }) => {
	api.orderProduct(order)
		.then((result) => {
			console.log("Заказ успешно оформлен", result);

			// Получаем шаблон
			const successTemplate = document.getElementById("success") as HTMLTemplateElement;
			const successContent = successTemplate.content.firstElementChild.cloneNode(true) as HTMLElement;

			const desc = successContent.querySelector(".order-success__description");
              if (desc) {
	             desc.textContent = `Списано ${order.total} синапсов`;
                }

            const closeBtn = successContent.querySelector(".order-success__close");
                closeBtn?.addEventListener("click", () => {
	              modal.close();
                });

            modal.setContent(successContent);
            modal.open();

            // Очищаем корзину
            basket.clear();

		})
		.catch((error) => {
			console.error("Ошибка оформления заказа:", error);
		});
});

api.getProductList()
  .then(products => {
    productsData.setProducts(products);
  })
  .catch(error => {
    console.error('Ошибка загрузки продуктов:', error);
  });