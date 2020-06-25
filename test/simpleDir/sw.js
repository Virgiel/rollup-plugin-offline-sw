// This file is generated at bundle time do not edit it
const date = "1593052407789";
const filesToCache = [
  "/",
  "/script.js",
  "/style.css",
  "/sw.js",
  "/text.txt",
];

const cacheName = 'cache' + date;

// The channel to communicate with the status bar
const channel = new BroadcastChannel('sw_channel');

// Called once every time a new service worker is installed
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        // Pre cache the whole website
        return cache.addAll(filesToCache);
      })
      .then(() => {
        // Replace the current service worker without waiting
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      if (cacheNames.length == 1) {
        // This is the first service worker install
        channel.postMessage('Installed');
      } else {
        // Remove previous installation
        Promise.all(
          cacheNames.map(name => {
            if (name !== cacheName) {
              return caches.delete(name);
            }
          })
        ).then(() => {
          channel.postMessage('Updated');
        });
      }
    })
  );
});

// Intercept fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
