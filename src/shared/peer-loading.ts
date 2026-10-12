/**
 * Lazy loading for optional peer dependencies (currently `bcrypt`).
 *
 * Peers load only when an operation needing them is first invoked, so
 * callers without the peer installed can still use every other
 * namespace. Async callers use dynamic `import`; sync callers use the
 * per-format `#sync-require` loader (native `require` in CJS,
 * `createRequire` anchored at the loader file in ESM). A peer that
 * cannot be resolved throws a `MissingPeerDependencyError` naming the
 * package to install; any other load failure propagates unchanged.
 */
import { loadSyncPeer } from '#sync-require';
import { MissingPeerDependencyError } from './errors.ts';

/**
 * Extracts the Node.js error code from an unknown load failure.
 *
 * @param error - Failure raised while loading the peer.
 * @returns The error code when present, otherwise undefined.
 */
function errorCodeOf(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  if (!('code' in error)) {
    return undefined;
  }
  const code: unknown = error.code;
  return typeof code === 'string' ? code : undefined;
}

/**
 * Reports whether a load failure means the peer is not installed.
 *
 * @param error - Failure raised while loading the peer.
 * @returns Whether the peer module could not be resolved.
 */
function isPeerMissing(error: unknown): boolean {
  const code: string | undefined = errorCodeOf(error);
  return code === 'MODULE_NOT_FOUND' || code === 'ERR_MODULE_NOT_FOUND';
}

/**
 * Builds the missing-peer error naming the package to install.
 *
 * @param specifier - Bare peer specifier that could not be resolved.
 * @param error - Original resolution failure, kept as `cause`.
 * @returns The missing-peer-dependency error.
 */
function missingPeerError(
  specifier: string,
  error: unknown
): MissingPeerDependencyError {
  return new MissingPeerDependencyError(
    `Optional peer dependency '${specifier}' is not installed. Install '${specifier}' to use this feature.`,
    { cause: error }
  );
}

/**
 * Loads a peer dependency asynchronously with dynamic `import`.
 *
 * @param specifier - Bare peer specifier to load (for example `bcrypt`).
 * @returns The loaded peer module.
 * @throws {MissingPeerDependencyError} WHEN the peer cannot be resolved.
 */
export function loadPeer(specifier: string): Promise<unknown> {
  const peer: Promise<unknown> = import(specifier).catch(
    (error: unknown): unknown => {
      if (isPeerMissing(error)) {
        throw missingPeerError(specifier, error);
      }
      throw error;
    }
  );
  return peer;
}

/**
 * Loads a peer dependency synchronously with the per-format loader.
 *
 * @param specifier - Bare peer specifier to load (for example `bcrypt`).
 * @returns The loaded peer module.
 * @throws {MissingPeerDependencyError} WHEN the peer cannot be resolved.
 */
export function loadPeerSync(specifier: string): unknown {
  try {
    const peer: unknown = loadSyncPeer(specifier);
    return peer;
  } catch (error: unknown) {
    if (isPeerMissing(error)) {
      throw missingPeerError(specifier, error);
    }
    throw error;
  }
}
