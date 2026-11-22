# Spec Delta

## Purpose

Defines the `digest` namespace contract: the `hash`/`hashSync` operation, the `DigestAlgorithm` identifier set (`md5`, `sha-256`, `sha-512`), accepted input types, optional output encodings, error codes and async/sync parity. Algorithm-specific computation, known-answer vectors and MD5 deprecation are specified by their own capabilities (`sha-2`, `md5`).

## ADDED Requirements

### Requirement: Hash operation

The `digest` capability SHALL provide `hash` (async) and `hashSync` (sync) that accept an algorithm identifier, data, and an optional output encoding, and return the digest of the data under that algorithm. When no encoding is given the result SHALL be a `Buffer`; when an encoding is given the result SHALL be the encoded text.

#### Scenario: Buffer output by default

- **WHEN** a caller awaits `hash('sha-256', 'abc')` or calls `hashSync('sha-256', 'abc')`
- **THEN** the call SHALL return a `Buffer` holding the digest bytes

#### Scenario: Encoded text output

- **WHEN** a caller requests `hash('sha-256', 'abc', 'hex')`
- **THEN** the call SHALL return the lowercase hexadecimal text of the digest

### Requirement: Supported algorithm identifiers

The `digest` capability SHALL accept the algorithm identifiers `'md5'`, `'sha-256'` and `'sha-512'` (as the `DigestAlgorithm` union) and SHALL throw an `UnsupportedAlgorithmError` for any other identifier, including malformed or unknown names.

#### Scenario: Unknown identifier

- **WHEN** a caller passes `algorithm: 'rot13'`
- **THEN** both variants SHALL throw with code `UNSUPPORTED_ALGORITHM`

#### Scenario: Algorithm name is public

- **WHEN** an unsupported algorithm is rejected
- **THEN** the error message SHALL name the received identifier and the supported set, and SHALL NOT echo data

### Requirement: Accepted input types

Data SHALL accept `CryptoInput` (`string` interpreted as UTF-8, `Buffer`, `Uint8Array`) per `shared-core`, normalizing through the shared `toBytes` helper so equivalent bytes in different container types yield identical digests.

#### Scenario: Equivalent containers

- **WHEN** the same bytes are passed as a UTF-8 string, a Buffer and a Uint8Array
- **THEN** every call SHALL return an equal digest

#### Scenario: Multibyte strings hash by UTF-8 bytes

- **WHEN** a caller hashes `'é'`
- **THEN** the input SHALL be interpreted as its UTF-8 byte sequence

### Requirement: Optional output encoding

`hash` and `hashSync` SHALL support `hex`, `base64` and `base64url` as the output encoding per `shared-core`, validating through the shared `assertSupportedEncoding` helper, and SHALL throw a `NodeCryptoError` with code `INVALID_ARGUMENT` for any other encoding value (including non-string values and `undefined` passed explicitly as the encoding).

#### Scenario: Each supported encoding

- **WHEN** a caller requests `hex`, `base64` or `base64url` output
- **THEN** the returned text SHALL strictly decode under that encoding to the digest bytes

#### Scenario: Unsupported encoding

- **WHEN** a caller passes an encoding outside `hex`, `base64` and `base64url`
- **THEN** both variants SHALL throw with code `INVALID_ARGUMENT`

### Requirement: Invalid arguments

Data of any type outside `CryptoInput` (including `null`, `undefined`, numbers and objects) SHALL cause both variants to throw a `NodeCryptoError` with code `INVALID_ARGUMENT`.

#### Scenario: Wrong data type

- **WHEN** a caller passes a non-`CryptoInput` value such as `hash('sha-256', 123 as never)`
- **THEN** both variants SHALL throw with code `INVALID_ARGUMENT`

### Requirement: Error message hygiene

Every error thrown by the `digest` capability SHALL be a `NodeCryptoError` with a stable code and SHALL NOT include data, digests or secrets in its message.

#### Scenario: No secret echo

- **WHEN** any `digest` call fails validation
- **THEN** the error message SHALL use a fixed description of the violated rule with no input value interpolated

### Requirement: Async and sync variant parity

`hash` and `hashSync` SHALL return equal results and throw equal error codes for equal inputs, the async variant wrapping the same synchronous primitive.

#### Scenario: Result parity

- **WHEN** `hash(a, b)` and `hashSync(a, b)` are called with the same arguments
- **THEN** both SHALL return an equal digest

#### Scenario: Error parity

- **WHEN** both variants receive the same invalid argument
- **THEN** both SHALL throw a `NodeCryptoError` with the same code

### Requirement: Approved cryptographic provider only

The `digest` capability SHALL delegate to `node:crypto` and SHALL NOT use any other cryptographic provider or hand-rolled primitive. The concrete digest computation for each `DigestAlgorithm` is provided by its own capability (`sha-2`, `md5`); until that capability lands, the dispatch case for that algorithm throws an `UnsupportedAlgorithmError`.

#### Scenario: No non-provider dependency

- **WHEN** the `digest` module is inspected
- **THEN** it SHALL import cryptographic primitives only from `node:crypto`
