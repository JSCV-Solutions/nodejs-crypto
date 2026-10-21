/**
 * Smoke test for the built output (task 2.3).
 * Loads every exported subpath through the package `exports` map with both
 * `import` (ESM build) and `require` (CJS build) and checks that each one
 * resolves to its own namespace. It then type-checks a consumer program
 * against the published declarations, so a namespace that points at a
 * declaration file the build never shipped fails here instead of in a
 * consumer's project. Run `pnpm build` first, then `pnpm smoke`.
 * See README for details.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');

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
  random: ['bytes', 'bytesSync', 'integer', 'integerSync', 'uuid'],
  comparison: ['equals', 'equalsSync']
};

// Namespaces that own type declarations list them here. Each one must
// be exported by its own namespace and must resolve from the built tree.
const expectedTypeExports = {
  random: ['IntegerOptions']
};

/**
 * Builds a consumer program that imports every namespace by name.
 *
 * The generated file is compiled twice, once as ESM and once as
 * CommonJS, so both the `import` and the `require` conditions of the
 * `exports` map are exercised. Each namespace is imported as a whole
 * and every expected member is referenced, so a missing member and a
 * declaration file the build never shipped both fail the check.
 *
 * @returns {string} The consumer source.
 */
function buildConsumerSource() {
  const lines = [];
  for (const subpath of subpaths) {
    const alias = subpath.replace(/-/g, '_');
    lines.push(
      `import * as ${alias}_ns from '@jscv-solutions/node-crypto/${subpath}';`
    );
    const functions = expectedFunctionExports[subpath] ?? ['namespace'];
    for (const name of functions) {
      lines.push(`export const __${alias}_${name} = ${alias}_ns.${name};`);
    }
    for (const name of expectedTypeExports[subpath] ?? []) {
      lines.push(`export type __${alias}_${name} = ${alias}_ns.${name};`);
    }
  }
  lines.push('export const __used = 1;');
  return `${lines.join('\n')}\n`;
}

/**
 * Resolves the TypeScript 7 command line compiler.
 *
 * @returns {string} Absolute path to the compiler entry point.
 */
function resolveCompiler() {
  const manifestPath = require.resolve('typescript-7/package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  return join(dirname(manifestPath), manifest.bin.tsc);
}

/**
 * Type-checks the consumer program against the built declarations.
 *
 * @returns {boolean} Whether the declarations type-check.
 */
function checkPublishedTypes() {
  const workDirectory = join(
    rootDirectory,
    'node_modules',
    '.cache',
    'dist-type-smoke'
  );
  rmSync(workDirectory, { recursive: true, force: true });
  mkdirSync(workDirectory, { recursive: true });
  try {
    writeFileSync(
      join(workDirectory, 'consumer.ts'),
      buildConsumerSource(),
      'utf8'
    );
    writeFileSync(
      join(workDirectory, 'consumer.cts'),
      buildConsumerSource(),
      'utf8'
    );
    writeFileSync(
      join(workDirectory, 'tsconfig.json'),
      `${JSON.stringify(
        {
          compilerOptions: {
            module: 'nodenext',
            moduleResolution: 'nodenext',
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            types: ['node']
          },
          files: ['consumer.ts', 'consumer.cts']
        },
        null,
        2
      )}\n`,
      'utf8'
    );
    const result = spawnSync(
      process.execPath,
      [resolveCompiler(), '-p', join(workDirectory, 'tsconfig.json')],
      { encoding: 'utf8' }
    );
    if (result.status !== 0) {
      console.error('failed - published declarations do not type-check');
      console.error(result.stdout);
      console.error(result.stderr);
      return false;
    }
    return true;
  } finally {
    rmSync(workDirectory, { recursive: true, force: true });
  }
}

let failures = 0;

for (const subpath of subpaths) {
  const specifier = `@jscv-solutions/node-crypto/${subpath}`;
  try {
    const esm = await import(specifier);
    const cjs = require(specifier);
    const names = expectedFunctionExports[subpath];
    const resolved =
      names === undefined
        ? esm.namespace === subpath && cjs.namespace === subpath
        : names.every(name => typeof esm[name] === 'function') &&
          names.every(name => typeof cjs[name] === 'function');
    if (resolved) {
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

if (!checkPublishedTypes()) {
  failures += 1;
} else {
  console.log('ok - published declarations type-check');
}

if (failures > 0) {
  console.error(`${failures} subpath(s) failed`);
  process.exit(1);
} else {
  console.log('smoke test passed');
}
