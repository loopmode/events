interface AddEventListenerOptions {
    capture?: boolean;
    passive?: boolean;
    target?: Window | Document | HTMLElement;
}
interface EventListener {
    handleEvent(evt: Event): void;
}
interface EventTarget {
    removeEventListener(
        type: string,
        listener: Function | EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        listener: Function | EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    dispatchEvent(evt: Event): boolean;
}

interface Subscription {
    dispose(): void;
}

declare module '@loopmode/events/Events' {
    export class Events {
        constructor();
        on(type: string, listener: Function | EventListener, options?: boolean | AddEventListenerOptions): Subscription;
        addEventListener(
            type: string,
            listener: Function | EventListener,
            options?: boolean | AddEventListenerOptions
        ): Subscription;
        off(type: string, listener: Function | EventListener, options?: boolean | AddEventListenerOptions): void;
        removeEventListener(
            type: string,
            listener: Function | EventListener,
            options?: boolean | AddEventListenerOptions
        ): void;
    }
}
