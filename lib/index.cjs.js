'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var globby = _interopDefault(require('globby'));
var colorette = require('colorette');

const rules = [
  {
    name: 'Image',
    types: ['png', 'jpg'],
  },
  {
    name: 'Icons',
    types: ['svg'],
  },
  {
    name: 'Script',
    types: ['js'],
  },
  {
    name: 'Style',
    types: ['css'],
  },
  {
    name: 'Html',
    types: ['html'],
  },
  {
    name: 'Data',
    types: ['txt', 'json', 'yaml'],
  },
];

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

/** Return the file extension from a file */
function extractExtension(path) {
  var dotIndex = path.lastIndexOf('.');
  return dotIndex == -1 ? null : path.substring(dotIndex + 1);
}

/** Generate a JavaScript file with data for the service worker */
function generateSWDataJS(date, files) {
  let buffer = '';
  for (const file of files) {
    buffer += `  \"${file}\",\n`;
  }
  return `/* ----- This file is generated, do not edit it ----- */

// The date of the generation. Used to invalidate previous cache
const date = \"${date}\";
// An array of paths to prefetch
const filesToCache = [
${buffer}];

// The name of the current cache
const cacheName = 'cache-' + date;

// The channel to communicate with clients
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
    caches.open(cacheName).then(cache => {
      return cache.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request.clone()).then(response => {
          // Cache font files at runtime
          if (
            response.status < 400 &&
            response.headers.get('content-type') &&
            response.headers.get('content-type').match(/^font\\//i)
          ) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});

`;
}

function serviceWorker(options = {}) {
  let {
    dir = './public',
    swName = 'sw.js',
    manualPaths = [],
    verbose = true,
  } = options;

  return {
    name: 'serviceWorker',
    async writeBundle() {
      // Get all files in src
      const paths = await globby(dir + '/**/*');
      // Sum prefetch size
      const rulesSum = new Array(rules.length).fill(0);
      let sum = 0;
      if (verbose) {
        for (const path of paths) {
          const size = fs.statSync(path).size;
          const extension = extractExtension(path);
          for (let i = 0; i < rules.length; i++) {
            if (rules[i].types.indexOf(extension) != -1) {
              rulesSum[i] += size;
            }
          }
          sum += size;
        }
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
      fs.writeFileSync(swSrc, generatedData);

      // Output generation result
      if (verbose) {
        console.log(colorette.blueBright(colorette.bold('Service Worker:')));
        for (let [i, rule] of rules.entries()) {
          const temp = rulesSum[i];
          if (temp > 0) {
            console.log(
              `${colorette.green(rule.name)} - ${colorette.yellow(colorette.bold(formatBytesHuman(temp)))}`
            );
          }
        }
        console.log(
          colorette.green(
            `${colorette.bold(finalPaths.length)} prefetched path for a total of ${colorette.yellow(
              colorette.bold(formatBytesHuman(sum))
            )}`
          )
        );
      }
    },
  };
}

module.exports = serviceWorker;
