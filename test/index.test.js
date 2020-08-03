import serviceWorker from '../lib/index';
import fs from 'fs';
import { red } from 'colorette';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

// Relocate test process in the test dir
process.chdir(__dirname);

// Init the plugin and execute it's functionality
async function generateSW(dir, config) {
  const defaultConfig = {
    dir: dir,
    swName: 'sw.js',
  };
  const plugin = serviceWorker({
    ...defaultConfig,
    ...config,
  });
  await plugin.writeBundle();
}

// Remove generated files during the test execution
function cleanAfterTest(dir) {
  const swPath = `./${dir}/sw.js`;
  fs.unlinkSync(swPath);
}

// Test two arrays are equivalent
function isEquivalent(a, b) {
  if (a.length != b.length) {
    return false;
  }

  for (const item of a) {
    if (b.indexOf(item) === -1) {
      return false;
    }
  }

  return true;
}

// Perform the test routine for the given directory
async function performTest(test) {
  // Invoke plugin and intercept logs
  let logs = '';
  {
    const oldLog = console.log;
    console.log = data => {
      logs += data + '\n';
    };
    await generateSW(test.dir, test.config);
    console.log = oldLog;
  }

  // Extract and check service worker results
  if (test.assert) {
    const serviceWorker = fs.readFileSync(`./${test.dir}/sw.js`, 'utf8');
    const valueRegex = /const filesToCache = \[[\s\S]*?\]/;
    const strRegex = /"(.)*"/g;
    const result = serviceWorker
      .match(valueRegex)[0]
      .match(strRegex)
      .map(it => it.replace(/"/g, ''));
    assert.ok(
      isEquivalent(result, test.assert),
      red(`[Err]\nExpected: ${test.assert}\nGot instead: ${result}`)
    );
  }

  // Perform logs check
  if (test.inspectLogs) {
    assert.ok(test.inspectLogs(logs));
  }

  // Clean up
  await cleanAfterTest(test.dir);
}

/* ----- Dir extraction test ----- */
test('SimpleDir', () =>
  performTest({
    dir: 'simpleDir',
    assert: ['/', '/sw.js', '/index.html', '/style.css', '/script.js'],
  }));
test('NestedDir', () =>
  performTest({
    dir: 'nestedDir',
    assert: [
      '/',
      '/sw.js',
      '/file.html',
      '/nested/file.html',
      '/nested/nested/file.html',
      '/nested/nested/nested/file.html',
    ],
  }));

/* ---- Manual path config est ----- */
test('ManualPath', () =>
  performTest({
    dir: 'simpleDir',
    config: {
      manualPaths: [
        'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
      ],
    },
    assert: [
      '/',
      '/sw.js',
      '/index.html',
      '/style.css',
      '/script.js',
      'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
    ],
  }));

/* ---- Filter prefetch paths test ----- */
test('MixedPath default', () =>
  performTest({
    dir: 'mixedDir',
    assert: ['/', '/index.html', '/style.css', '/script.js', '/sw.js'],
  }));
test('MixedPath full', () =>
  performTest({
    dir: 'mixedDir',
    config: {
      prefetchTypes: ['*'],
    },
    assert: [
      '/',
      '/data.json',
      '/index.html',
      '/style.css',
      '/script.js',
      '/text.txt',
      '/sw.js',
    ],
  }));
test('MixedPath none', () =>
  performTest({
    dir: 'mixedDir',
    config: {
      prefetchTypes: [],
    },
    assert: ['/', '/sw.js'],
  }));

/* ----- Verbose output test ----- */
test('Verbose', () =>
  performTest({
    dir: 'simpleDir',
    inspectLogs: logs => logs.split('\n').length === 3,
  }));
test('Not Verbose', () =>
  performTest({
    dir: 'simpleDir',
    config: {
      verbose: false,
    },
    inspectLogs: logs => logs.length === 0,
  }));
test('Verbose + Prefetched', () =>
  performTest({
    dir: 'simpleDir',
    config: {
      verbose: true,
      showPrefetchedPaths: true,
    },
    inspectLogs: logs => logs.split('\n').length === 9,
  }));
test('Verbose full', () =>
  performTest({
    dir: 'simpleDir',
    config: {
      verbose: true,
      showPrefetchedPaths: true,
      showIgnoredPaths: true,
    },
    inspectLogs: logs => logs.split('\n').length === 11,
  }));

test.run();
