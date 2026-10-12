/**
 * Finishes each build output directory after `tsc` runs, as the last step
 * of `pnpm build`. See README for details.
 *
 * Writes a `package.json` with the correct `type` field so Node.js
 * interprets the ESM and CJS trees correctly. Each file also carries the
 * `#sync-require` import specifier pointing at that tree's own
 * synchronous peer loader: the nested `package.json` defines the closest
 * package scope, so without it Node.js would not see the root `imports`
 * map when `peer-loading` resolves its loader.
 *
 * Copies the hand-written `src/shared/typings/*.d.ts` declarations into
 * each tree. `tsc` checks declaration inputs but does not re-emit them,
 * while the emitted per-module `.d.ts` files reference them through
 * `./typings/*.js` imports, so without the copy consumer typechecks
 * would fail on a missing module.
 */
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  {
    directory: join(rootDirectory, 'dist', 'esm'),
    type: 'module',
    syncRequire: './shared/require-sync-esm.js'
  },
  {
    directory: join(rootDirectory, 'dist', 'cjs'),
    type: 'commonjs',
    syncRequire: './shared/require-sync-cjs.js'
  }
];

for (const target of targets) {
  await mkdir(target.directory, { recursive: true });
  const content = `${JSON.stringify(
    {
      type: target.type,
      imports: { '#sync-require': target.syncRequire }
    },
    null,
    2
  )}\n`;
  await writeFile(join(target.directory, 'package.json'), content, 'utf8');
  await cp(
    join(rootDirectory, 'src', 'shared', 'typings'),
    join(target.directory, 'shared', 'typings'),
    { recursive: true }
  );
}
