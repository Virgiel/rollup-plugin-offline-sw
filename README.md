# rollup-plugin-offline-sw

A rollup plugin to generate service worker script for online access of your static website

**Disclaimer: This project is intended for my personal usage. If you need a well-tested solution with more features take a look at [Workbox](https://github.com/GoogleChrome/workbox). But if you want to experiments with service workers you are free to use and copy my code.**

## Installation

```
TODO
```

## Usage

```
TODO
```

### Events

The service worker emits events in a broadcast channel named `sw-channel`. Those events are :

- Installed : Triggered when the service worker is installed for the first time.
- Updated : Triggered when the service worker have been updated and await page reload.

### Hot reload

For hot reloading to work properly it is recommended to activate "Update on reload" and "Bypass for network" in DevTools > Application > Service Workers.

## Options

TODO

## Licence

Unlicense
