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
import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = join(rootDirectory, 'src');

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

/**
 * Finds every hand-written `typings` folder under `src`.
 *
 * Each namespace owns a `typings` folder next to its runtime modules,
 * and the shared area owns one too. `tsc` type-checks declaration
 * inputs but never re-emits them, while the emitted per-module `.d.ts`
 * files reference them through `./typings/*.js` imports. Collecting the
 * folders by name keeps the copy complete for every namespace instead
 * of hard-coding one path.
 *
 * @param {string} directory - Directory to search.
 * @returns {Promise<string[]>} Paths of the `typings` folders found.
 */
async function findTypingsFolders(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const entryPath = join(directory, entry.name);
    if (entry.name === 'typings') {
      found.push(entryPath);
      continue;
    }
    found.push(...(await findTypingsFolders(entryPath)));
  }
  return found;
}

const typingsFolders = await findTypingsFolders(sourceDirectory);

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
  for (const folder of typingsFolders) {
    await cp(
      folder,
      join(target.directory, relative(sourceDirectory, folder)),
      { recursive: true }
    );
  }
}
