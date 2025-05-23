import { IProduct } from "../types";
import { IEvents } from "./base/events";
import { IBasketItem } from "../types";
import { Model } from "./base/Model";

export class ProductsData extends Model<ProductsData> {
    private products: IProduct[] = [];
    private preview: string | null = null;

    constructor(eventBroker: IEvents) {
        super({}, eventBroker);
        this.events.on<IProduct>("basket:add", (product) => {
            this.events.emit<IBasketItem>("basket:addProduct", product);
        });
    }

    setProducts(products: IProduct[]): void {
        this.products = [...products];
        this.emitChanges("products:set", { products });
    }

    getProducts(): IProduct[] {
        return this.products;
    }

    setPreview(productId: string | null): void {
        this.preview = productId;
        this.emitChanges("products:preview", { productId });
    }

    getPreview(): string | null {
        return this.preview;
    }

    subscribeToProducts(callback: (products: IProduct[]) => void): void {
        this.events.on<{ products: IProduct[] }>("products:set", (data) => {
            callback(data.products);
        });
    }
}