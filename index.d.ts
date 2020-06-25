import rollup from 'rollup';

interface ServiceWorkerOptions {
  /** Path to the root directory of the website. @default './public' */
  readonly dir?: string;

  /** The name of the service worker file. @default './sw.js' */
  readonly swName?: string;

  /** An array of path to prefect. Useful for http request that can't be found by the plugin. @default [] */
  readonly manualPath?: string;
}

/** Generate a service worker script to precache the root directory  */
export default function serviceWorker(
  options?: ServiceWorkerOptions
): rollup.Plugin;
