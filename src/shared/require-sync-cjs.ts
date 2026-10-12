/**
 * Synchronous peer loader for CommonJS callers.
 *
 * This file is compiled only in the CJS build and the typecheck program
 * (see the `#sync-require` mapping and the per-build `exclude` lists).
 * The module-scoped `require` resolves the peer relative to this file.
 *
 * @param specifier - Bare peer specifier to load (for example `bcrypt`).
 * @returns The loaded peer module.
 */
export function loadSyncPeer(specifier: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- this per-format file ships only in the CJS build, where require is the correct loader
  const peer: unknown = require(specifier);
  return peer;
}
