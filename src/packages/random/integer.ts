/**
 * Cryptographically secure bounded integers.
 *
 * Both functions draw from the `node:crypto` CSPRNG (`randomInt`)
 * and never from `Math.random`. Bounds use half-open semantics:
 * `min` is inclusive, `max` is exclusive, mirroring `randomInt`.
 */
import { randomInt } from 'node:crypto';
import { InvalidArgumentError } from '../../shared/errors.ts';
import type { IntegerOptions } from './typings/integer.js';

/**
 * Generates a uniform random integer in `[min, max)`.
 *
 * @param options - Bounds holding `min` (inclusive, defaults to `0`) and `max` (exclusive).
 * @returns A promise of the generated integer.
 * @throws {InvalidArgumentError} WHEN the bounds are missing, unsafe, or empty, delivered as a rejected promise.
 */
export async function integer(options: IntegerOptions): Promise<number> {
  try {
    const bounds: { min: number; max: number } = resolveBounds(options);
    return await new Promise<number>(
      (
        resolve: (value: number) => void,
        reject: (reason: unknown) => void
      ): void => {
        randomInt(
          bounds.min,
          bounds.max,
          (error: Error | null | undefined, value: number): void => {
            if (error) {
              reject(error);
              return;
            }
            resolve(value);
          }
        );
      }
    );
  } catch (error: unknown) {
    throw mapGeneratorError(error);
  }
}

/**
 * Generates a uniform random integer in `[min, max)` synchronously.
 *
 * @param options - Bounds holding `min` (inclusive, defaults to `0`) and `max` (exclusive).
 * @returns The generated integer.
 * @throws {InvalidArgumentError} WHEN the bounds are missing, unsafe, or empty.
 */
export function integerSync(options: IntegerOptions): number {
  const bounds: { min: number; max: number } = resolveBounds(options);
  try {
    return randomInt(bounds.min, bounds.max);
  } catch (error: unknown) {
    throw mapGeneratorError(error);
  }
}

/**
 * Validates caller bounds and applies the default minimum.
 *
 * @param options - Candidate bounds object.
 * @returns The resolved inclusive `min` and exclusive `max`.
 * @throws {InvalidArgumentError} WHEN the input is not an object, a bound is not a safe integer, or `min` is not below `max`.
 */
function resolveBounds(options: IntegerOptions): {
  min: number;
  max: number;
} {
  const candidate: unknown = options;
  if (typeof candidate !== 'object' || candidate === null) {
    throw new InvalidArgumentError(
      'Invalid options: expected an object with min and max.'
    );
  }
  const fields: { min?: unknown; max?: unknown } = candidate;
  const min: number = fields.min === undefined ? 0 : assertBound(fields.min);
  const max: number = assertBound(fields.max);
  if (min >= max) {
    throw new InvalidArgumentError('Invalid bounds: expected min below max.');
  }
  return { min, max };
}

/**
 * Rejects bounds the CSPRNG cannot serve.
 *
 * @param value - Candidate bound.
 * @returns The bound as a safe integer.
 * @throws {InvalidArgumentError} WHEN the bound is not a safe integer.
 */
function assertBound(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new InvalidArgumentError(
      'Invalid bounds: expected safe integer bounds.'
    );
  }
  return value;
}

/**
 * Keeps generator failures inside the stable error contract.
 *
 * Validated bounds only exceed the provider ceiling (`max - min`
 * below `2^48`) when callers pick an enormous range, so a
 * `RangeError` here becomes an invalid bounds error. Anything else
 * is rethrown untouched.
 *
 * @param error - Failure escaped from `node:crypto`.
 * @returns The failure to throw, never the original `RangeError`.
 */
function mapGeneratorError(error: unknown): Error {
  if (error instanceof RangeError) {
    return new InvalidArgumentError(
      'Invalid bounds: expected a range below 2^48.'
    );
  }
  if (error instanceof Error) {
    return error;
  }
  return new InvalidArgumentError(
    'Invalid bounds: expected safe integer bounds.'
  );
}
