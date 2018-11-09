'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Events = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _detectPassiveEvents = require('detect-passive-events');

var _detectPassiveEvents2 = _interopRequireDefault(_detectPassiveEvents);

var _windowOrGlobal = require('window-or-global');

var _windowOrGlobal2 = _interopRequireDefault(_windowOrGlobal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function createSignature(_ref) {
    var target = _ref.target,
        type = _ref.type,
        capture = _ref.capture,
        passive = _ref.passive;

    return 'target:' + target + ',type:' + type + ',capture:' + capture + ',passive:' + passive;
}

function createEventOptions() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        passive = _ref2.passive,
        capture = _ref2.capture;

    if (_detectPassiveEvents2.default.hasSupport === true) {
        return { capture: capture, passive: passive };
    }
    return capture;
}

function mergeOptions(options, target) {
    if (!target) {
        target = options ? options.target || _windowOrGlobal2.default : _windowOrGlobal2.default;
    }
    if (typeof options === 'boolean') {
        return { target: target, capture: options };
    } else {
        return _extends({ target: target }, options);
    }
}

var Events = exports.Events = (_temp = _class = function () {
    function Events() {
        _classCallCheck(this, Events);

        this.handlers = {};
        this.listeners = {};

        this.on = this.on.bind(this);
        this.off = this.off.bind(this);

        if (!this.constructor.prototype.__shortcutsInitialized) {
            this.constructor.prototype.__shortcutsInitialized = true;
            this.initializeShortcuts();
        }
    }

    _createClass(Events, [{
        key: 'on',
        value: function on(type, listener) {
            var _this = this;

            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            options = mergeOptions(options);

            var _options = options,
                _options$target = _options.target,
                target = _options$target === undefined ? _windowOrGlobal2.default : _options$target,
                _options$capture = _options.capture,
                capture = _options$capture === undefined ? false : _options$capture,
                _options$passive = _options.passive,
                passive = _options$passive === undefined ? false : _options$passive;


            if (typeof target === 'string') {
                target = this.constructor.knownTargets[target];
            }

            if (!target) {
                if (process.env.NODE_ENV === 'development') {
                    console.warn('Invalid target. Using ' + _windowOrGlobal2.default + ' instead.');
                }
                target = _windowOrGlobal2.default;
            }

            if (process.env.NODE_ENV === 'development') {
                if (Object.values(this.constructor.knownTargets).indexOf(target) === -1) {
                    console.warn('\n                        [Events] Unknown target ' + target + '.\n                        Make sure that its toString method returns a unique value.\n                        Set toString.isUnique flag to remove this warning.\n                        ').replace(/\s\s+/g, ' ');
                }
            }

            var signature = createSignature({ target: target, type: type, capture: capture, passive: passive });

            if (!this.listeners[signature]) {
                this.listeners[signature] = [];
            }

            if (this.listeners[signature].indexOf(listener) === -1) {
                this.listeners[signature].push(listener);
            }

            if (!this.handlers[signature]) {
                this.handlers[signature] = function (event) {
                    return _this.listeners[signature].forEach(function (cb) {
                        return cb(event);
                    });
                };
                target.addEventListener(type, this.handlers[signature], createEventOptions({ passive: passive, capture: capture }));
            }

            return { dispose: function dispose() {
                    return _this.off(type, listener, { target: target, capture: capture, passive: passive });
                } };
        }
    }, {
        key: 'addEventListener',
        value: function addEventListener(type, listener, options) {
            return this.on(type, listener, options);
        }
    }, {
        key: 'off',
        value: function off(type, listener) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            options = mergeOptions(options);

            var _options2 = options,
                _options2$target = _options2.target,
                target = _options2$target === undefined ? _windowOrGlobal2.default : _options2$target,
                _options2$capture = _options2.capture,
                capture = _options2$capture === undefined ? false : _options2$capture,
                _options2$passive = _options2.passive,
                passive = _options2$passive === undefined ? false : _options2$passive;


            var signature = createSignature({ target: target, type: type, capture: capture, passive: passive });

            if (this.listeners[signature]) {
                var index = this.listeners[signature].indexOf(listener);

                this.listeners[signature].splice(index, 1);
            }

            if (this.listeners[signature] && this.listeners[signature].length === 0 && this.handlers[signature]) {
                target.removeEventListener(type, this.handlers[signature], createEventOptions({ passive: passive, capture: capture }));
                this.handlers[signature] = undefined;
            }
        }
    }, {
        key: 'removeEventListener',
        value: function removeEventListener(type, listener, options) {
            return this.on(type, listener, options);
        }
    }, {
        key: 'initializeShortcuts',
        value: function initializeShortcuts() {
            var _this2 = this;

            Object.entries(this.constructor.knownTargets).forEach(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    name = _ref4[0],
                    target = _ref4[1];

                var proto = _this2.constructor.prototype;
                proto.on[name] = function (type, listener, options) {
                    return proto.on(type, listener, mergeOptions(options, target));
                };
                proto.off[name] = function (type, listener, options) {
                    return proto.off(type, listener, mergeOptions(options, target));
                };
            });
        }
    }]);

    return Events;
}(), _class.knownTargets = {
    window: _windowOrGlobal2.default,

    document: _windowOrGlobal2.default && _windowOrGlobal2.default['document'],

    body: _windowOrGlobal2.default && _windowOrGlobal2.default['document'] ? _windowOrGlobal2.default['document']['body'] : undefined
}, _temp);
exports.default = new Events();