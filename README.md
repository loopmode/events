# @loopmode/events

Unified global event handling.

Registers no more than a single listener per event type, invokes all registered callbacks.
The event listener is created when needed and removed again when obsolete.

-   Safe support for passive events via [detect-passive-events](https://github.com/rafrex/detect-passive-events)
-   Currently, only `window`, `document` and `body` are supported as event targets (Default is `window`)

<br />
Supports the same signature as [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener),
so it should be safe to search and replace in your code as follows:

-   `window.addEventListener` -> `Events.on`
-   `document.addEventListener('mousedown', this.handleMouseDown)` -> `Events.on.document('mousedown', this.handleMouseDown)`
-   `document.addEventListener('mousedown', this.handleMouseDown)` -> `Events.on('mousedown', this.handleMouseDown, {target: document})`
-   `window.removeEventListener` -> `Events.off`
-   ...

## Documentation

See [https://loopmode.github.io/events/](https://loopmode.github.io/events/)

## Motivation

Keep the number of global event listeners low, especially when using in react components that are rendered dozens or hundrets of time on the screen.
Support passive events, stay as light-weight as possible.

## Installation

```
yarn add @loopmode/events
```

## Usage

The default export is a singleton instance of the class. Typically, that's what you want.

Basic usage:

```
import Events from '@loopmode/events';

function onResize(event) {
    console.log('resize', event)
}

Events.on('resize', onResize);
Events.off('resize', onResize);


// remember to pass the same options when removing listeners:
Events.on('resize', onResize, {capture: true});
Events.off('resize', onResize, {capture: true})


// alternatively, use returned object with dispose function:
const listener = Events.on('mousemove', onResize, {capture: true, target: document.body, passive: true})
// no need to provide any arguments
listener.dispose();
```

In react component, with passive option:

```
import React, { PureComponent } from 'react';
import Events from '@loopmode/events';

export class MyComponent extends PureComponent {
    state = {
        delta: 0
    };
    componentDidMount() {
        this.wheelListener = Events.on('wheel', this.handleWheel, { passive: true })
    }
    componentWillUnmount() {
        // same as Events.off('wheel', this.handleWheel, { passive: true })
        this.wheelListener.dispose();
    }
    handleWheel = (event) => {
        this.setState({
            delta: event.deltaY
        })
    };
    render() {
        return (
            <div>{this.state.delta}</div>
        );
    }
}
```

If you need additional instances, use the named `Events` export:

```
import { Events } from '@loopmode/events';

const myEvents = new Events();

function onResize(event) {
    console.log('resize', event)
}

myEvents.on('resize', onResize);
```

Every instance may register up to one global event listener per event type.
