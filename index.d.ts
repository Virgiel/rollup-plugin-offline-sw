import rollup from 'rollup';

interface ServiceWorkerOptions {
  /** Path to the root directory of the website. @default './public' */
  readonly dir?: string;

  /** The name of the service worker file. @default 'sw.js' */
  readonly swName?: string;

  /** Array of path to prefect. Useful for http request that can't be found by the plugin. @default [] */
  readonly manualPaths?: Array<string>;

  /** Outputs prefetch sizes to the console. @default true  */
  readonly verbose?: boolean;
}

/** Generate a service worker script to precache the root directory  */
export default function serviceWorker(
  options?: ServiceWorkerOptions
): rollup.Plugin;
