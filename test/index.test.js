import serviceWorker from '../src/index';
import fs from 'fs';
import { blueBright, green, red } from 'colorette';

// Relocate test process in the test dir
process.chdir(__dirname);

// Init the plugin and execute it's functionality
async function generateSW(dir) {
  const plugin = serviceWorker({
    dir: dir,
    swName: 'sw.js',
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
  await generateSW(test.dir);
  const serviceWorker = fs.readFileSync(`./${test.dir}/sw.js`, 'utf8');
  const valueRegex = /const filesToCache = \[[\s\S]*\]/gs;
  const strRegex = /"(.)*"/g;
  const result = serviceWorker
    .match(valueRegex)[0]
    .match(strRegex)
    .map(it => it.replace(/"/g, ''));
  if (isEquivalent(result, test.assert)) {
    console.log(blueBright(`Test ${test.dir}: `) + green('[OK]\n'));
  } else {
    console.log(
      blueBright(`Test ${test.dir}: `) +
        red(`[Err]\nExpected: ${test.assert}\nGot instead: ${result}\n`)
    );
  }
  await cleanAfterTest(test.dir);
}

// All test to perform
const testList = [
  {
    dir: 'simpleDir',
    assert: ['/', '/sw.js', '/text.txt', '/style.css', '/script.js'],
  },
  {
    dir: 'nestedDir',
    assert: [
      '/',
      '/sw.js',
      '/file',
      '/nested/file',
      '/nested/nested/file',
      '/nested/nested/nested/file',
    ],
  },
];

for (const dir of testList) {
  performTest(dir);
}
