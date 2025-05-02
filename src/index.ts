import './scss/styles.scss';
import { ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ProductAPI } from './components/ProductAPI';
import { ProductsData } from './components/ProductsData';
import { ProductList } from './components/ProductList';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { DeliveryAddressModal } from './components/common/DeliveryAddressModal';
import { UserInfoModal } from './components/common/UserInfoModal';
import { SuccessModal } from './components/common/SuccessModal';
import { IOrder } from './types';

const events = new EventEmitter();
const api = new ProductAPI(CDN_URL, API_URL);

const modalContainer = ensureElement<HTMLElement>('#modal-container');
const modal = new Modal(modalContainer, events);
const successModal = new SuccessModal(modalContainer, events);

const productsData = new ProductsData(events);
const basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
const basket = new Basket(basketCounter, modal, productsData, events);

const galleryContainer = ensureElement<HTMLElement>('.gallery');
new ProductList(galleryContainer, productsData, api, modal, events, basket);

events.on<{
  formElement: HTMLFormElement;
  parentModal: Modal;
  orderData: Partial<IOrder & { payment: string; total: number }>;
}>('basket:checkout', ({ formElement, parentModal, orderData }) => {
  const deliveryAddressModal = new DeliveryAddressModal(
    formElement,
    parentModal,
    events,
    orderData
  );
  deliveryAddressModal.open();
});

events.on<{
  formElement: HTMLFormElement;
  parentModal: Modal;
  orderData: Partial<IOrder & { payment: string; total: number }>;
}>('delivery:submitted', ({ formElement, parentModal, orderData }) => {
  const userInfoModal = new UserInfoModal(
    formElement,
    events,
    parentModal,
    orderData
  );
  userInfoModal.open();
});

events.on<IOrder & { payment: string; total: number }>('order:confirm', (order) => {
	api.orderProduct(order)
	  .then(result => {
		console.log('Отправлено на сервер:', result);
		successModal.open();
		successModal.setTotal(order.total);
		basket.clear();
	  })
	  .catch(err => {
		console.error('Ошибка при отправке заказа:', err);
	  });
  });

api.getProductList()
  .then(products => {
    productsData.setProducts(products);
  })
  .catch(error => {
    console.error('Ошибка загрузки продуктов:', error);
  });