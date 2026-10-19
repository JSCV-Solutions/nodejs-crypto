/**
 * Secure random generation: bytes, bounded integers and UUIDs.
 *
 * Everything here draws from the `node:crypto` CSPRNG. `bytes` and
 * `integer` come in async plus `Sync` variants; `uuid` is
 * synchronous only because `node:crypto` `randomUUID` performs no
 * I/O worth awaiting.
 */
export { bytes, bytesSync } from './bytes.ts';
export { integer, integerSync } from './integer.ts';
export { uuid } from './uuid.ts';
export type { IntegerOptions } from './typings/integer.js';
