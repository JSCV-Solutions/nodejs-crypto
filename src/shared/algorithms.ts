/**
 * Algorithm identifier validation shared by every namespace.
 *
 * Identifiers are lowercase kebab-case strings (for example `sha-256`,
 * `argon2id`). Anything a function does not support — unknown names and
 * malformed identifiers alike — throws an `UnsupportedAlgorithmError`.
 * Identifiers are public names and safe to include in messages.
 */
import { UnsupportedAlgorithmError } from './errors.ts';

/**
 * Asserts the received identifier is one of the supported identifiers.
 *
 * @param algorithm - Identifier passed by the caller.
 * @param supported - Identifiers the calling function supports.
 * @throws {UnsupportedAlgorithmError} WHEN the identifier is unsupported.
 */
export function assertSupportedAlgorithm(
  algorithm: string,
  supported: readonly string[]
): void {
  if (!supported.includes(algorithm)) {
    throw new UnsupportedAlgorithmError(
      `Unsupported algorithm '${algorithm}'. Supported algorithms: ${supported.join(', ')}.`
    );
  }
}
