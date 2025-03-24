export interface IProduct {
    id: string;
    description?: string;
    image: string;
    title: string;
    category: string;
    price: number;
}

export interface IBasketItem {
    id: string;
    price: number;
}

export interface IAddressForm {
    address: string;
}

export interface IOrderForm {
    email: string;
    address: string;
    phone: string;
}

export interface IOrder extends IOrderForm {
    items: string[]
}

export interface IOrderResult {
    id: string;
}