/**
 * Error model shared by every namespace of the library.
 *
 * Every error thrown by the library is an instance of `NodeCryptoError`
 * (or a subclass) and carries a stable string `code` that callers can
 * switch on. Codes are part of the public contract: never rename or
 * remove one without a major release.
 *
 * Message hygiene: constructors accept a message built by the throwing
 * code. Callers MUST NOT interpolate secrets, passwords, keys or
 * plaintext into messages. Algorithm identifiers and package names are
 * public and safe to include.
 */
import type { ErrorCode } from './typings/errors.js';

/**
 * Base class for every error thrown by the library.
 */
export class NodeCryptoError extends Error {
  /** Stable machine-readable failure identifier. */
  public readonly code: ErrorCode;

  /**
   * Creates a library error with a stable code.
   *
   * @param message - Human-readable description without secrets.
   * @param code - Stable machine-readable failure identifier.
   * @param options - Optional error options (for example `cause`).
   */
  public constructor(message: string, code: ErrorCode, options?: ErrorOptions) {
    super(message, options);
    this.name = 'NodeCryptoError';
    this.code = code;
  }
}

/**
 * A function received an argument of the wrong type or range.
 */
export class InvalidArgumentError extends NodeCryptoError {
  /**
   * Creates an invalid-argument error.
   *
   * @param message - Human-readable description without secrets.
   * @param options - Optional error options (for example `cause`).
   */
  public constructor(message: string, options?: ErrorOptions) {
    super(message, 'INVALID_ARGUMENT', options);
    this.name = 'InvalidArgumentError';
  }
}

/**
 * Encoded text contains characters outside its alphabet or breaks the
 * encoding rules (for example odd-length hexadecimal).
 */
export class InvalidEncodingError extends NodeCryptoError {
  /**
   * Creates an invalid-encoding error.
   *
   * @param message - Human-readable description without echoing the input.
   * @param options - Optional error options (for example `cause`).
   */
  public constructor(message: string, options?: ErrorOptions) {
    super(message, 'INVALID_ENCODING', options);
    this.name = 'InvalidEncodingError';
  }
}

/**
 * An optional peer dependency (for example `bcrypt`) is not installed,
 * so the requested operation cannot run.
 */
export class MissingPeerDependencyError extends NodeCryptoError {
  /**
   * Creates a missing-peer-dependency error.
   *
   * @param message - Description naming the package and how to install it.
   * @param options - Optional error options (for example `cause`).
   */
  public constructor(message: string, options?: ErrorOptions) {
    super(message, 'MISSING_PEER_DEPENDENCY', options);
    this.name = 'MissingPeerDependencyError';
  }
}

/**
 * The caller passed an algorithm identifier the function does not support.
 */
export class UnsupportedAlgorithmError extends NodeCryptoError {
  /**
   * Creates an unsupported-algorithm error.
   *
   * @param message - Description naming the received identifier.
   * @param options - Optional error options (for example `cause`).
   */
  public constructor(message: string, options?: ErrorOptions) {
    super(message, 'UNSUPPORTED_ALGORITHM', options);
    this.name = 'UnsupportedAlgorithmError';
  }
}
