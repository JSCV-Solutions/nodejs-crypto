/**
 * Constant-time comparison of secret material.
 *
 * `equals` and `equalsSync` compare two operands for byte equality
 * without leaking prefix information through timing.
 */
export { equals, equalsSync } from './equals.ts';
export type { CryptoInput } from '../../shared/typings/inputs.js';
