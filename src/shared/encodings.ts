/**
 * Binary-to-text encodings shared by every namespace.
 *
 * Supported encodings are `hex`, `base64` and `base64url`. Decoding is
 * strict: input outside the encoding alphabet (or breaking its length
 * and padding rules) throws an `InvalidEncodingError` instead of being
 * silently truncated the way `Buffer.from` would on its own. Error
 * messages never echo the offending input.
 */
import { InvalidEncodingError } from './errors.ts';
import type { Encoding } from './typings/encodings.js';

const HEXPattern: RegExp = /^[0-9a-fA-F]*$/;
const base64Pattern: RegExp =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const base64UrlPaddedPattern: RegExp =
  /^(?:[A-Za-z0-9\-_]{4})*(?:[A-Za-z0-9\-_]{2}==|[A-Za-z0-9\-_]{3}=)?$/;
const base64UrlUnpaddedPattern: RegExp = /^[A-Za-z0-9\-_]*$/;

/**
 * Encodes bytes as text with the requested encoding.
 *
 * @param data - Bytes to encode.
 * @param encoding - Target text encoding.
 * @returns The encoded text (`base64url` output is unpadded).
 */
export function encodeBytes(data: Uint8Array, encoding: Encoding): string {
  const buffer: Buffer = Buffer.from(data);
  const text: string = buffer.toString(encoding);
  return text;
}

/**
 * Decodes text back into bytes, strictly validating the input.
 *
 * @param text - Encoded text to decode.
 * @param encoding - Text encoding the input claims to use.
 * @returns The decoded bytes.
 * @throws {InvalidEncodingError} WHEN the text breaks the encoding rules.
 */
export function decodeText(text: string, encoding: Encoding): Buffer {
  if (!isWellFormed(text, encoding)) {
    throw new InvalidEncodingError(
      `Invalid ${encoding} string: input breaks the ${encoding} rules.`
    );
  }
  const buffer: Buffer = Buffer.from(text, encoding);
  return buffer;
}

/**
 * Checks text against the alphabet and shape rules of an encoding.
 *
 * `base64` follows the padded canonical form. `base64url` accepts the
 * unpadded form the encoder emits (whose length is never one past a
 * multiple of four) as well as correctly padded input.
 *
 * @param text - Candidate encoded text.
 * @param encoding - Encoding whose rules apply.
 * @returns Whether the text is well formed for the encoding.
 */
export function isWellFormed(text: string, encoding: Encoding): boolean {
  if (encoding === 'hex') {
    return text.length % 2 === 0 && HEXPattern.test(text);
  }
  if (encoding === 'base64') {
    return text.length % 4 === 0 && base64Pattern.test(text);
  }
  if (text.includes('=')) {
    return text.length % 4 === 0 && base64UrlPaddedPattern.test(text);
  }
  return text.length % 4 !== 1 && base64UrlUnpaddedPattern.test(text);
}
