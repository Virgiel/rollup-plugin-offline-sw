# rollup-plugin-offline-sw

A rollup plugin to generate service worker script for offline access of your
static website

**Disclaimer: This project is intended for my personal usage. If you need a
well-tested solution with more features take a look at
[Workbox](https://github.com/GoogleChrome/workbox). But if you want to
experiment with service workers you are free to use and copy my code.**

## Installation

```yaml
// package.json
{
  "devDependencies": {
    "rollup-plugin-offline-sw": "git+https://git@github.com/Virgiel/rollup-plugin-offline-sw.git#v0.2.0"
  }
}
```

## Usage

### Rollup Plugin

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

### Service Worker Manager

It's a good design to inform users of the current service worker state, however
this state is tricky to observe. The SwManager handle service worker
registration and observation while exposing an easy to use API with three
events.

#### Events

- `initialized`: Service worker is installed for the first time.
- `waiting`: A new service worker is available but it's waiting for activation.
- `updated`: A new service worker is now active, the content need to be
  refreshed.

#### Exemple

```js
import {
  SwManager,
  INITIALIZED,
  WAITING,
  UPDATED,
} from 'rollup-plugin-offline-sw/manager';

manager.onEvent = event => {
  if (event === INITIALIZED) {
    console.log('The website is now accessible offline');
  } else if (event === WAITING) {
    // If there are losable states (e.g forms) it's a good practice to
    // prompt a dialog to let the user choose when to skip waiting state
    manager.skipWaiting();
    status = WAITING;
  } else if (event === UPDATED) {
    window.location.reload(false);
  }
};

manager.register('/sw.js');
```

## Configuration

#### dir

Type: `string` • Default: `'./public'`

Path to the root directory of the website

#### swName

Type: `string` • Default: `'sw.js'`

The name of the service worker file.

#### swName

Type: `boolean` • Default: `false`

If in dev mode a dummy service worker file will be generated.

#### manualPaths

Type: `Array<string>` • Default: `[]`

Paths to prefetch, useful for http request that can't be found by the plugin.

#### prefetchExtensions

Type: `Array<string>` • Default: `['js','css','html','svg']`

Files extensions to prefetch.

#### runtimeTypes

Type: `Array<RegExp>` • Default: `[/^font\//]`

Content-type's regex to filter fetch response to cache at runtime.

#### verbose

Type: `boolean` • Default: `true`

Output generation infos in the console.

#### showPrefetchedPaths

Type: `boolean` • Default: `false`

Add the list of prefetched paths to generation infos.

#### showIgnoredPaths

Type: `boolean` • Default: `false`

Add the list of ignored paths to generation infos.

## TODO

This is a list of features I might add if I find the time and/or my projects
require them

- Configurable prefetch rules with a size limit
- Different fetching and caching strategy
- Runtime fetch cache with size limit

## Licence

Unlicense
