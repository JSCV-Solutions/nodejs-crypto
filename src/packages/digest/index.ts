/**
 * Digests of data.
 *
 * `hash` and `hashSync` compute a digest under the algorithm named by
 * the caller. The namespace exports its own `DigestAlgorithm` type;
 * the shared `CryptoInput` operand type stays internal to the library.
 */
export { hash, hashSync } from './hash.ts';
export type { DigestAlgorithm } from './typings/digest.js';
