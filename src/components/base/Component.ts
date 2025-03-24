import {IEvents} from "./events";

export abstract class Component<T> {
    protected container: HTMLElement;

    protected constructor(container: HTMLElement) {
        this.container = container;
    }

    toggleClass(element: HTMLElement, className: string, force?: boolean) {
        element.classList.toggle(className, force);
    }

    protected setText(element: HTMLElement, value: unknown) {
        if (element) element.textContent = String(value);
    }

    setDisabled(element: HTMLElement, state: boolean) {
        if (element) {
            if (state) element.setAttribute('disabled', 'disabled');
            else element.removeAttribute('disabled');
        }
    }

    protected setHidden(element: HTMLElement) {
        element.style.display = 'none';
    }

    protected setVisible(element: HTMLElement) {
        element.style.removeProperty('display');
    }

    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) element.alt = alt;
        }
    }

    /** Новый метод: получение и клонирование шаблона из DOM */
    protected getTemplate(id: string): HTMLElement {
        const template = document.getElementById(id) as HTMLTemplateElement | null;
        if (!template) {
            throw new Error(`Template "${id}" not found`);
        }
        return template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    }

    protected setCategoryColor(element: HTMLElement, category: string): void {
        // Сопоставление категорий с классами
        const categoryClassMap: Record<string, string> = {
            "софт-скил": "card__category_soft",
            "другое": "card__category_other",
            "дополнительное": "card__category_additional",
            "кнопка": "card__category_button",
            "хард-скил": "card__category_hard",
        };
    
        // Убираем все существующие классы для категорий
        element.classList.remove(
            "card__category_soft",
            "card__category_other",
            "card__category_additional",
            "card__category_button",
            "card__category_hard"
        );
    
        // Добавляем новый класс
        const categoryClass = categoryClassMap[category];
        if (categoryClass) {
            element.classList.add(categoryClass);
        }
    }

    /** Новый метод: Форматирование цены */
    protected formatPrice(value: number): string {
        return value >= 10000 ? value.toLocaleString("ru-RU") : value.toString();
    }

    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}