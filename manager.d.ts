export const INITIALIZED: boolean;
export const WAITING: string;
export const UPDATED: string;

/** Manage service worker subscription and expose as small API with three events */
export class SwManager {
  /** Event listener */
  onEvent: (event: string) => void;
  /**
   * Register service worker and start notifying events
   * @param swPath The path for service worker path
   * */
  register(swPath: string): void;
  /** Force a waiting service worker to become active */
  skipWaiting(): void;
}
