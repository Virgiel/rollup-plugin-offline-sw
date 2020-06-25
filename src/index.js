import { writeFileSync, statSync } from 'fs';
import globby from 'globby';
import { blueBright, bold, green, yellow } from 'colorette';

/** Format bytes to a human readable size */
function formatBytesHuman(bytes) {
  const list = ['b', 'Kb', 'Mb', 'Gb', 'Tb'];
  for (const it of list) {
    if (bytes < 1000) {
      return `${bytes}${it}`;
    } else {
      bytes = (bytes / 1000).toFixed(2);
    }
  }
  return `${bytes}Tb`;
}
/** Generate a JavaScript file with data for the service worker */
function generateSWDataJS(date, files) {
  let buffer = '';
  for (const file of files) {
    buffer += `  \"${file}\",\n`;
  }
  buffer;
  return `// This file is generated

// The date of the generation. Used to invalidate previous cache
const date = \"${date}\";
// An array of paths to prefetch
const filesToCache = [
${buffer}];

// The name of the current cache
const cacheName = 'cache-' + date;

// The channel to communicate with the status bar
const channel = new BroadcastChannel('sw_channel');

// Called once every time a new service worker is installed
self.addEventListener('install', event => {
  // Create the cache and initialize it
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

// Called once every time a new service worker become active
self.addEventListener('activate', event => {
  // Delete previous caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      if (cacheNames.length == 1) {
        // This is the first service worker install
        channel.postMessage('Installed');
      } else {
        // Remove previous caches
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
  // Apply a cache first strategy
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
`;
}

export default function serviceWorker(options = {}) {
  let { dir = './public', swName = 'sw.js', manualPaths = [] } = options;

  return {
    name: 'serviceWorker',
    async writeBundle() {
      // Get all files in src
      const paths = await globby(dir + '/**/*', {});
      // Sum file paths
      let sum = 0;
      for (const path of paths) {
        sum += statSync(path).size;
      }
      // Make path relative to dir
      const relativePaths = paths.map(path => path.replace(dir, ''));
      // Add manual path and src path
      const finalPaths = ['/'].concat(relativePaths, manualPaths);
      if (finalPaths.indexOf(`/${swName}`) == -1) {
        finalPaths.push(`/${swName}`);
      }

      // Generate service worker data
      const date = Date.now();
      const generatedData = generateSWDataJS(date, finalPaths);

      // Write the service worker data file
      const swSrc = `${dir}/${swName}`;
      writeFileSync(swSrc, generatedData);

      console.log(
        `${blueBright(bold('Service Worker data:'))} ${green(
          `${bold(finalPaths.length)} fetch paths, ${bold(
            relativePaths.length
          )} static files for`
        )} ${yellow(bold(formatBytesHuman(sum)))}`
      );
    },
  };
}
