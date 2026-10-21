/**
 * Constant-time comparison of secret material.
 *
 * `equals` and `equalsSync` compare two operands for byte equality
 * without leaking prefix information through timing. The namespace
 * exports no types of its own: the operand type belongs to the shared
 * input contract and stays internal to the library.
 */
export { equals, equalsSync } from './equals.ts';
