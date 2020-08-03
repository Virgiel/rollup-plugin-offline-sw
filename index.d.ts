import rollup from 'rollup';

interface ServiceWorkerOptions {
  /**
   * Path to the root directory of the website.
   * @default './public'
   */
  readonly dir?: string;

  /**
   * The name of the service worker file.
   * @default 'sw.js'
   */
  readonly swName?: string;

  /**
   * If in dev mode a dummy service worker file will be generated.
   * @default false
   */
  readonly dev?: boolean;

  /**
   * Paths to prefetch, useful for http request that can't be found by the plugin.
   * @default []
   */
  readonly manualPaths?: Array<string>;

  /**
   * Files extensions to prefetch.
   * @default ['js','css','html','svg']
   */
  readonly prefetchExtensions?: Array<string>;

  /**
   * Content-type's regex to filter fetch response to cache at runtime.
   * @default [/^font\//],
   */
  readonly runtimeTypes?: Array<RegExp>;

  /**
   * Output generation infos in the console.
   * @default true
   */
  readonly verbose?: boolean;

  /**
   * Add the list of prefetched paths to generation infos.
   * @default false
   */
  readonly showPrefetchedPaths?: boolean;

  /**
   * Add the list of ignored paths to generation infos.
   * @default false
   */
  readonly showIgnoredPaths?: boolean;
}

/** Generate a service worker script to support offline access to your website  */
export default function serviceWorker(
  options?: ServiceWorkerOptions
): rollup.Plugin;
