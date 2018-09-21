import detectPassiveEvents from 'detect-passive-events';

function createSignature({ target, type, capture, passive }) {
    return `target:${target},type:${type},capture:${capture},passive:${passive}`;
}

function createEventOptions({ passive, capture } = {}) {
    if (detectPassiveEvents.hasSupport === true) {
        return { capture, passive };
    }
    return capture;
}

function mergeOptions(options, target) {
    if (!target) {
        target = options ? options.target || window : window;
    }
    if (typeof options === 'boolean') {
        return { target, capture: options };
    } else {
        return { target, ...options };
    }
}

/**
 * The Events class.
 * Creates a single global event listener per type and target.
 *
 * Usually, you want to use only one instance of this class.
 * (Use the default export which is a singleton instance)
 */
export class Events {
    /**
     * An object containing "known targets" that are supported by default and for which shortcuts are added to the `on` nad `off` methods.
     *
     * @property {Window} window - The [Window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object
     * @property {HTMLDocument} document - The [Document](https://developer.mozilla.org/en-US/docs/Web/API/Document) object
     * @property {HTMLBodyElement} body - The [Document.body](https://developer.mozilla.org/en-US/docs/Web/API/Document/body) object
     */
    static knownTargets = {
        window: window,
        // document might not exist
        document: window && window['document'],
        // document.body might not exist
        body: window && window['document'] ? window['document']['body'] : undefined
    };

    /**
     * A `signature<String>: handler<Function>` hashmap
     * @private
     */
    handlers = {};

    /**
     * A `signature<String>: listeners:<Array>` hashmap
     * @private
     */
    listeners = {};

    /**
     * Creates new instance.
     * Adds shortcuts to the `on` and `off` methods for all known targets.
     */
    constructor() {
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);

        if (!this.constructor.prototype.__shortcutsInitialized) {
            this.constructor.prototype.__shortcutsInitialized = true;
            this.initializeShortcuts();
        }
    }

    /**
     * Adds an event listener callback.
     * Creates a global event listener if necessary.
     * Returns an object with a dispose function that can be called without arguments to remove the event listener callback.
     *
     * @param {String} type - A case-sensitive string representing the [event type](https://developer.mozilla.org/en-US/docs/Web/Events) to listen for.
     * @param {Function} listener - The event listener callback
     * @param {Object|Boolean} [options] - An [options object](https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#eventlisteneroptions) or a [boolean `useCapture` flag](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#The_event_listener_callback#Parameters)
     * @param {Boolean} [options.capture] - Whether to listen during the capturing phase
     * @param {Boolean} [options.passive] - Whether to use a passive event listener
     * @param {Object|String} [options.target=window] - The target element on which to add the event listener.
     *
     * @return {Object} - An object with a `dispose` function.
     */
    on(type, listener, options = {}) {
        options = mergeOptions(options);

        let { target = window, capture = false, passive = false } = options;

        if (typeof target === 'string') {
            // in case a valid string was provided, e.g. 'window' or 'global'
            target = this.constructor.knownTargets[target];
        }

        if (!target) {
            // in case an invalid string was provided, e.g. 'foo', or 'body' in server-side code
            if (process.env.NODE_ENV === 'development') {
                console.warn(`Invalid target. Using ${window} instead.`);
            }
            target = window;
        }

        if (process.env.NODE_ENV === 'development') {
            if (Object.values(this.constructor.knownTargets).indexOf(target) === -1) {
                console
                    .warn(
                        `
                        [Events] Unknown target ${target}.
                        Make sure that its toString method returns a unique value.
                        Set toString.isUnique flag to remove this warning.
                        `
                    )
                    .replace(/\s\s+/g, ' ');
            }
        }

        const signature = createSignature({ target, type, capture, passive });

        if (!this.listeners[signature]) {
            this.listeners[signature] = [];
        }

        if (this.listeners[signature].indexOf(listener) === -1) {
            this.listeners[signature].push(listener);
        }

        if (!this.handlers[signature]) {
            this.handlers[signature] = event => this.listeners[signature].forEach(cb => cb(event));
            target.addEventListener(type, this.handlers[signature], createEventOptions({ passive, capture }));
        }

        return { dispose: () => this.off(type, listener, { target, capture, passive }) };
    }

    /**
     * Removes an event listener callback.
     * Removes the global event listener as well if the callback was the only one.
     *
     * @param {String} type - A case-sensitive string representing the [event type](https://developer.mozilla.org/en-US/docs/Web/Events) to listen for.
     * @param {Function} listener - The event listener callback
     * @param {Object|Boolean} [options] - An [options object](https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#eventlisteneroptions) or a [boolean `capture` flag](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#The_event_listener_callback#Parameters)
     * @param {Boolean} [options.capture] - Whether to listen during the capturing phase
     * @param {Boolean} [options.passive] - Whether to use a passive event listener
     * @param {Object|String} [options.target=window] - The target element on which to add the event listener.
     */
    off(type, listener, options = {}) {
        options = mergeOptions(options);

        let { target = window, capture = false, passive = false } = options;

        const signature = createSignature({ target, type, capture, passive });

        if (this.listeners[signature]) {
            const index = this.listeners[signature].indexOf(listener);
            this.listeners[signature].splice(index, 1);
        }

        if (this.listeners[signature].length === 0 && this.handlers[signature]) {
            target.removeEventListener(type, this.handlers[signature], createEventOptions({ passive, capture }));
            this.handlers[signature] = undefined;
        }
    }

    /**
     * Adds shortcut functions to the `on` and `off` methods for all known targets.
     * Each function is configured with the proper target.
     *
     * Effectively, these two lines will execute the same:
     * - `Events.on.body('click', this.handleBodyClick)`
     * - `Events.on('click', this.handleBodyClick, { target: body })`
     * @private
     */
    initializeShortcuts() {
        Object.entries(this.constructor.knownTargets).forEach(([name, target]) => {
            const proto = this.constructor.prototype;
            proto.on[name] = (type, listener, options) => proto.on(type, listener, mergeOptions(options, target));
            proto.off[name] = (type, listener, options) => proto.off(type, listener, mergeOptions(options, target));
        });
    }
}

export default new Events();
