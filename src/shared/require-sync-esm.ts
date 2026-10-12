/**
 * Synchronous peer loader for ECMAScript module callers.
 *
 * This file is compiled only in the ESM build and the typecheck program
 * (see the `#sync-require` mapping and the per-build `exclude` lists), so
 * `import.meta` never reaches CommonJS output. The `createRequire` anchor
 * is this file, so the peer resolves from the consumer's installation.
 */
import { createRequire } from 'node:module';

const peerRequire: NodeJS.Require = createRequire(import.meta.url);

/**
 * Loads a peer dependency synchronously for ESM callers.
 *
 * @param specifier - Bare peer specifier to load (for example `bcrypt`).
 * @returns The loaded peer module.
 */
export function loadSyncPeer(specifier: string): unknown {
  const peer: unknown = peerRequire(specifier);
  return peer;
}
