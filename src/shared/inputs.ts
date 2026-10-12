/**
 * Input handling shared by every namespace.
 *
 * Wherever a function accepts data it accepts `CryptoInput`: a UTF-8
 * string, a Buffer or a Uint8Array. Normalization copies the bytes, so
 * later mutation of a caller-provided view cannot affect the operation.
 */
import { InvalidArgumentError } from './errors.ts';
import type { CryptoInput } from './typings/inputs.js';

/**
 * Normalizes accepted input into a fresh Buffer of bytes.
 *
 * @param input - String (UTF-8), Buffer or Uint8Array holding the data.
 * @returns A Buffer copy of the input bytes.
 * @throws {InvalidArgumentError} WHEN the input has an unexpected type.
 */
export function toBytes(input: CryptoInput): Buffer {
  if (typeof input === 'string') {
    const buffer: Buffer = Buffer.from(input, 'utf8');
    return buffer;
  }
  if (input instanceof Uint8Array) {
    const buffer: Buffer = Buffer.from(input);
    return buffer;
  }
  throw new InvalidArgumentError(
    'Invalid input: expected a string, Buffer or Uint8Array.'
  );
}
