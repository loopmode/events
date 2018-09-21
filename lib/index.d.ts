interface AddEventListenerOptions {
    capture?: boolean;
    passive?: boolean;
    target?: Window | Document | HTMLElement;
}
interface EventListener {
    handleEvent(evt: Event): void;
}

interface Subscription {
    dispose(): void;
}
declare module '@loopmode/events' {
    export function on(
        type: string,
        listener: Function | EventListener,
        options?: boolean | AddEventListenerOptions
    ): Subscription;
    export function addEventListener(
        type: string,
        listener: Function | EventListener,
        options?: boolean | AddEventListenerOptions
    ): Subscription;
    export function off(
        type: string,
        listener: Function | EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
    export function removeEventListener(
        type: string,
        listener: Function | EventListener,
        options?: boolean | AddEventListenerOptions
    ): void;
}
