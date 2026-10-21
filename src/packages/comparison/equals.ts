/**
 * Constant-time comparison of secret material.
 *
 * Every function here delegates same-length equality to
 * `node:crypto` `timingSafeEqual` and never uses early-exit
 * comparison (`===`, `Buffer.equals`) or a hand-rolled loop.
 * Comparisons of operands with differing byte lengths return
 * `false` instead of throwing.
 */
import { timingSafeEqual } from 'node:crypto';
import { toBytes } from '../../shared/inputs.ts';
import type { CryptoInput } from '../../shared/typings/inputs.js';

/**
 * Compares two operands for byte equality in constant time.
 *
 * @param first - First operand: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @param second - Second operand: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @returns A promise of `true` when both operands hold identical bytes, and `false` otherwise (including differing byte lengths).
 * @throws {InvalidArgumentError} WHEN either operand is not a string, `Buffer` or `Uint8Array`, delivered as a rejected promise.
 */
export function equals(
  first: CryptoInput,
  second: CryptoInput
): Promise<boolean> {
  try {
    return Promise.resolve(equalsSync(first, second));
  } catch (error: unknown) {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Compares two operands for byte equality in constant time, synchronously.
 *
 * @param first - First operand: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @param second - Second operand: a UTF-8 string, `Buffer` or `Uint8Array`.
 * @returns `true` when both operands hold identical bytes, and `false` otherwise (including differing byte lengths).
 * @throws {InvalidArgumentError} WHEN either operand is not a string, `Buffer` or `Uint8Array`.
 */
export function equalsSync(first: CryptoInput, second: CryptoInput): boolean {
  const a: Buffer = toBytes(first);
  const b: Buffer = toBytes(second);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
