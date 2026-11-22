/**
 * Digests of data.
 *
 * `hash` and `hashSync` compute a digest under the algorithm named by
 * the caller. This change provides the namespace contract (validation,
 * dispatch, encoding, error codes and async/sync parity); the concrete
 * computation for each `DigestAlgorithm` arrives with `add-sha-2`
 * (SHA-256, SHA-512) and `add-md5` (MD5), which replace the
 * placeholder dispatch cases below.
 */
import { assertSupportedAlgorithm } from '../../shared/algorithms.ts';
import { assertSupportedEncoding } from '../../shared/encodings.ts';
import { UnsupportedAlgorithmError } from '../../shared/errors.ts';
import { toBytes } from '../../shared/inputs.ts';
import type { Encoding } from '../../shared/typings/encodings.js';
import type { CryptoInput } from '../../shared/typings/inputs.js';
import type { DigestAlgorithm } from './typings/digest.js';

const supportedAlgorithms: readonly DigestAlgorithm[] = [
  'md5',
  'sha-256',
  'sha-512'
];

/**
 * Computes the digest of `data` under `algorithm`.
 *
 * @param algorithm - Digest algorithm identifier.
 * @param data - Data to digest: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @returns A promise of a `Buffer` holding the digest bytes.
 * @throws {UnsupportedAlgorithmError} WHEN `algorithm` is not a supported `DigestAlgorithm`, delivered as a rejected promise.
 * @throws {InvalidArgumentError} WHEN `data` is not `CryptoInput` or `encoding` is unsupported, delivered as a rejected promise.
 */
export function hash(
  algorithm: DigestAlgorithm,
  data: CryptoInput
): Promise<Buffer>;

/**
 * Computes the digest of `data` under `algorithm`, encoded as text.
 *
 * @param algorithm - Digest algorithm identifier.
 * @param data - Data to digest: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @param encoding - Output encoding: `hex`, `base64` or `base64url`.
 * @returns A promise of the encoded digest text.
 * @throws {UnsupportedAlgorithmError} WHEN `algorithm` is not a supported `DigestAlgorithm`, delivered as a rejected promise.
 * @throws {InvalidArgumentError} WHEN `data` is not `CryptoInput` or `encoding` is unsupported, delivered as a rejected promise.
 */
export function hash(
  algorithm: DigestAlgorithm,
  data: CryptoInput,
  encoding: Encoding
): Promise<string>;

export async function hash(
  algorithm: DigestAlgorithm,
  data: CryptoInput,
  encoding?: Encoding
): Promise<Buffer | string> {
  if (encoding === undefined) {
    return await Promise.resolve(hashSync(algorithm, data));
  }
  return await Promise.resolve(hashSync(algorithm, data, encoding));
}

/**
 * Computes the digest of `data` under `algorithm`, synchronously.
 *
 * @param algorithm - Digest algorithm identifier.
 * @param data - Data to digest: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @returns A `Buffer` holding the digest bytes.
 * @throws {UnsupportedAlgorithmError} WHEN `algorithm` is not a supported `DigestAlgorithm`.
 * @throws {InvalidArgumentError} WHEN `data` is not `CryptoInput` or `encoding` is unsupported.
 */
export function hashSync(algorithm: DigestAlgorithm, data: CryptoInput): Buffer;

/**
 * Computes the digest of `data` under `algorithm`, synchronously, encoded as text.
 *
 * @param algorithm - Digest algorithm identifier.
 * @param data - Data to digest: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @param encoding - Output encoding: `hex`, `base64` or `base64url`.
 * @returns The encoded digest text.
 * @throws {UnsupportedAlgorithmError} WHEN `algorithm` is not a supported `DigestAlgorithm`.
 * @throws {InvalidArgumentError} WHEN `data` is not `CryptoInput` or `encoding` is unsupported.
 */
export function hashSync(
  algorithm: DigestAlgorithm,
  data: CryptoInput,
  encoding: Encoding
): string;

export function hashSync(
  algorithm: DigestAlgorithm,
  data: CryptoInput,
  encoding?: Encoding
): Buffer | string {
  assertSupportedAlgorithm(algorithm, supportedAlgorithms);
  toBytes(data);
  if (encoding !== undefined) {
    assertSupportedEncoding(encoding);
  }
  switch (algorithm) {
    case 'md5':
    case 'sha-256':
    case 'sha-512':
      throw new UnsupportedAlgorithmError(
        'Unsupported algorithm: not yet implemented.'
      );
    default:
      throw new UnsupportedAlgorithmError(
        `Unsupported algorithm '${String(algorithm)}'.`
      );
  }
}
