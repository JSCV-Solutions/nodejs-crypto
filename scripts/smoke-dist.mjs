/**
 * Smoke test for the built output (task 2.3).
 * Loads every exported subpath through the package `exports` map with both
 * `import` (ESM build) and `require` (CJS build) and checks that each one
 * resolves to its own namespace. Run `pnpm build` first, then
 * `pnpm smoke`. See README for details.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const subpaths = [
  'encryption',
  'digest',
  'message-authentication',
  'password-hashing',
  'key-derivation',
  'random',
  'comparison'
];

// Namespaces with real implementations list the function exports the
// built trees must expose. Namespaces still on placeholder scaffolding
// keep the legacy `namespace` marker until their change lands.
const expectedFunctionExports = {
  random: ['bytes', 'bytesSync', 'integer', 'integerSync', 'uuid']
};

function resolvesToNamespace(loaded, subpath) {
  const names = expectedFunctionExports[subpath];
  if (names !== undefined) {
    return names.every(name => typeof loaded[name] === 'function');
  }
  return loaded.namespace === subpath;
}

let failures = 0;

for (const subpath of subpaths) {
  const specifier = `@jscv-solutions/node-crypto/${subpath}`;
  try {
    const esm = await import(specifier);
    const cjs = require(specifier);
    if (
      resolvesToNamespace(esm, subpath) &&
      resolvesToNamespace(cjs, subpath)
    ) {
      console.log(`ok - ${specifier}`);
    } else {
      failures += 1;
      console.error(`mismatch - ${specifier}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`failed - ${specifier}`, error);
  }
}

if (failures > 0) {
  console.error(`${failures} subpath(s) failed`);
  process.exit(1);
} else {
  console.log('smoke test passed');
}
