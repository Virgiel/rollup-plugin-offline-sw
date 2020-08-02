/* ----- Service Worker Manager Events ----- */

const INITIALIZED = 'initialized';
const WAITING = 'waiting';
const UPDATED = 'updated';

/* ----- Service Worker Manager Class ----- */

class SwManager {
  constructor() {
    this.onEvent = () => {};
  }
  register(swPath) {
    // If service workers are not supported do nothing
    if ('serviceWorker' in navigator) {
      // Check if a service worker is already active
      const isInitialization = navigator.serviceWorker.controller == null;

      // Notify controller change
      navigator.serviceWorker.oncontrollerchange = event => {
        this.onEvent(UPDATED);
      };

      // Register the service worker
      navigator.serviceWorker.register(swPath).then(registration => {
        this.registration = registration;

        if (isInitialization) {
          // Listen to activation and notify for initialization
          if (registration.active.state == 'activated') {
            this.onEvent(INITIALIZED);
          } else {
            registration.active.addEventListener('statechange', () => {
              if (event.target.state == 'activated') {
                this.onEvent(INITIALIZED);
              }
            });
          }
        }

        // Listen to update and notify for wait
        registration.addEventListener('updatefound', () => {
          registration.installing.addEventListener('statechange', () => {
            if (event.target.state == 'installed') {
              this.onEvent(WAITING);
            }
          });
        });
      });
    }
  }
  skipWaiting() {
    this.registration.waiting.postMessage('skip');
  }
}

export { SwManager, INITIALIZED, WAITING, UPDATED };
