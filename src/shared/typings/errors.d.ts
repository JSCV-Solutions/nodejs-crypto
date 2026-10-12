/**
 * Stable string codes identifying every failure of the library. Codes
 * are part of the public contract: never rename or remove one without
 * a major release.
 */
export type ErrorCode =
  | 'INVALID_ARGUMENT'
  | 'INVALID_ENCODING'
  | 'MISSING_PEER_DEPENDENCY'
  | 'UNSUPPORTED_ALGORITHM';
