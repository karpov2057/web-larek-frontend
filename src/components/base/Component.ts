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

    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) element.alt = alt;
        }
    }

    protected getTemplate(id: string): HTMLElement {
        const tpl = document.getElementById(id) as HTMLTemplateElement | null;
        if (!tpl) throw new Error(`Template "${id}" not found`);
        return tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    }

    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}