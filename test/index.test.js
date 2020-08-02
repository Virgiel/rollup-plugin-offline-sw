import serviceWorker from '../lib/index';
import fs from 'fs';
import { red } from 'colorette';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

const VERBOSE = false;

// Relocate test process in the test dir
process.chdir(__dirname);

// Init the plugin and execute it's functionality
async function generateSW(dir, config) {
  const defaultConfig = {
    dir: dir,
    swName: 'sw.js',
    verbose: VERBOSE,
    showRulesPaths: true,
    showPrefetchPaths: true,
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
  await generateSW(test.dir, test.config);
  const serviceWorker = fs.readFileSync(`./${test.dir}/sw.js`, 'utf8');
  const valueRegex = /const filesToCache = \[[\s\S]*\]/gs;
  const strRegex = /"(.)*"/g;
  const result = serviceWorker
    .match(valueRegex)[0]
    .match(strRegex)
    .map(it => it.replace(/"/g, ''));
  assert.ok(
    isEquivalent(result, test.assert),
    red(`[Err]\nExpected: ${test.assert}\nGot instead: ${result}`)
  );
  await cleanAfterTest(test.dir);
}

// All test to perform
test('SimpleDir', () =>
  performTest({
    dir: 'simpleDir',
    assert: ['/', '/sw.js', '/text.txt', '/style.css', '/script.js'],
  }));
test('NestedDir', () =>
  performTest({
    dir: 'nestedDir',
    assert: [
      '/',
      '/sw.js',
      '/file',
      '/nested/file',
      '/nested/nested/file',
      '/nested/nested/nested/file',
    ],
  }));
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
      '/text.txt',
      '/style.css',
      '/script.js',
      'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
    ],
  }));

test.run();
