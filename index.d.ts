import rollup from 'rollup';

interface ServiceWorkerOptions {
  /** Path to the root directory of the website. @default './public' */
  readonly dir?: string;

  /** The name of the service worker file. @default 'sw.js' */
  readonly swName?: string;

  /** If in dev mode a dummy service worker file will be generated. @default false */
  readonly dev?: boolean;

  /** Array of path to prefect. Useful for http request that can't be found by the plugin. @default [] */
  readonly manualPaths?: Array<string>;

  /** Outputs generation infos in the console. @default true  */
  readonly verbose?: boolean;

  /** Add the list of paths affected by each rules to generation infos. @default false */
  readonly showRulesPaths?: boolean;

  /** Add the list of prefetched paths to generation infos. @default false */
  readonly showPrefetchPaths?: boolean;
}

/** Generate a service worker script to precache the root directory  */
export default function serviceWorker(
  options?: ServiceWorkerOptions
): rollup.Plugin;
