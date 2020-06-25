# rollup-plugin-offline-sw

A rollup plugin to generate service worker script for online access of your static website

**Disclaimer: This project is intended for my personal usage. If you need a well-tested solution with more features take a look at [Workbox](https://github.com/GoogleChrome/workbox). But if you want to experiment with service workers you are free to use and copy my code.**

## Installation

```yaml
// package.json
{
  "devDependencies": {
    "rollup-plugin-offline-sw": "git+https://git@github.com/Virgiel/rollup-plugin-offline-sw.git"
  }
}
```

## Usage

```js
// rollup.config.js
import serviceWorker from 'rollup-plugin-offline-sw';

export default {
  input: 'src/index.js',
  output: {
    file: 'public/bundle.js',
    format: 'cjs',
  },
  plugins: [serviceWorker()],
};
```

### Events

The service worker emits events in a broadcast channel named `sw-channel`. Those events are :

- `Installed` : Triggered when the service worker is installed for the first time.
- `Updated` : Triggered when the service worker have been updated and await page reload.

### Hot reload

For hot reloading to work properly it is recommended to activate "Update on reload" and "Bypass for network" in DevTools > Application > Service Workers.

## Configuration

#### dir

Type: `string` • Default: `'./public'`

Path to the root directory of the website

#### swName

Type: `string` • Default: `'sw.js'`

The name of the service worker file.

#### manualPaths

Type: `Array<string>` • Default: `[]`

Array of path to prefect. Useful for http requests that can't be found by the plugin.

#### verbose

Type: `boolean` • Default: `true`

Outputs prefetch sizes to the console.

## TODO

This is a list of features I might add if I find the time and/or my projects require them

- Add fallback rules for non handled files
- Configurable prefetch rules with a size limit
- More verbose output with path list for each rule
- Different fetching and caching strategy?
- Runtime rules?

## Licence

Unlicense
