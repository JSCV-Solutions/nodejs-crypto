/**
 * Deprecation signalling shared by every namespace.
 *
 * A deprecated algorithm is marked with the JSDoc `@deprecated` tag at
 * its declaration site and calls `emitDeprecationWarning` on first use.
 * Warnings go through `process.emitWarning` (never `console.warn`) so
 * they honor `--no-warnings` and `--disable-warning`, and each stable
 * warning code is emitted at most once per process. The algorithm name
 * is public and safe to include in the message.
 */

const emittedCodes: Set<string> = new Set<string>();

/**
 * Derives the stable process-warning code for a deprecated algorithm.
 *
 * @param algorithm - Lowercase kebab-case algorithm identifier.
 * @returns The stable warning code for the algorithm.
 */
export function deprecationCodeFor(algorithm: string): string {
  const token: string = algorithm.toUpperCase().replace(/-/g, '_');
  return `NODE_CRYPTO_DEPRECATED_${token}`;
}

/**
 * Emits the deprecation warning for an algorithm, once per process.
 *
 * @param algorithm - Lowercase kebab-case algorithm identifier.
 */
export function emitDeprecationWarning(algorithm: string): void {
  const code: string = deprecationCodeFor(algorithm);
  if (emittedCodes.has(code)) {
    return;
  }
  emittedCodes.add(code);
  process.emitWarning(
    `The '${algorithm}' algorithm is deprecated and will be removed in a future major release.`,
    { code, type: 'DeprecationWarning' }
  );
}
