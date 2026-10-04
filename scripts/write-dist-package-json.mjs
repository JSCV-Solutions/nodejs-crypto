/**
 * Writes a `package.json` with the correct `type` field into each build
 * output directory so Node.js interprets the ESM and CJS trees correctly.
 * Runs as the last step of `pnpm build`. See README for details.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  { directory: join(rootDirectory, 'dist', 'esm'), type: 'module' },
  { directory: join(rootDirectory, 'dist', 'cjs'), type: 'commonjs' }
];

for (const target of targets) {
  await mkdir(target.directory, { recursive: true });
  const content = `${JSON.stringify({ type: target.type }, null, 2)}\n`;
  await writeFile(join(target.directory, 'package.json'), content, 'utf8');
}
