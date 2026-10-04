# Spec Delta

## Purpose

Defines the behavior that every namespace of the library shares: errors, encodings, inputs, sync and async variants, algorithm identifiers, deprecation and optional dependency loading.

## ADDED Requirements

### Requirement: Error model

All errors thrown by the library SHALL be instances of `NodeCryptoError` or a subclass, SHALL expose a stable string `code`, and SHALL NOT include secrets, passwords, keys or plaintext in their message.

#### Scenario: Invalid argument

- **WHEN** a function receives an argument of the wrong type or range
- **THEN** it SHALL throw a `NodeCryptoError` with code `INVALID_ARGUMENT`

#### Scenario: Error message hygiene

- **WHEN** any operation fails
- **THEN** the error message SHALL NOT contain the password, key or plaintext that was passed in

### Requirement: Unsupported algorithm identifiers

Algorithm identifiers SHALL be lowercase kebab-case strings, and an identifier that a function does not support SHALL cause a `NodeCryptoError` with code `UNSUPPORTED_ALGORITHM`.

#### Scenario: Unknown identifier

- **WHEN** a caller passes `algorithm: 'rot13'`
- **THEN** the call SHALL throw with code `UNSUPPORTED_ALGORITHM`

### Requirement: Encodings and input types

Wherever a function accepts data it SHALL accept `string` (interpreted as UTF-8), `Buffer` and `Uint8Array`, and wherever a function can return binary data as text it SHALL support the encodings `hex`, `base64` and `base64url`.

#### Scenario: Equivalent inputs

- **WHEN** the same bytes are passed as a string, a Buffer or a Uint8Array
- **THEN** the result SHALL be identical

#### Scenario: Malformed encoded input

- **WHEN** an encoded string contains characters outside its alphabet
- **THEN** the function SHALL throw with code `INVALID_ENCODING`

### Requirement: Async and sync variants

Every public operation SHALL be available as an async function and as a synchronous function whose name adds the `Sync` suffix, and both variants SHALL return equal results and throw equal errors for equal inputs.

#### Scenario: Variant parity

- **WHEN** an operation is called through its async and its sync variant with the same inputs
- **THEN** both SHALL produce the same output or the same error code

### Requirement: Deprecation signalling

A deprecated algorithm SHALL be marked with the JSDoc `@deprecated` tag and SHALL emit a single process warning per process, with a stable warning code, the first time it is used.

#### Scenario: First use of a deprecated algorithm

- **WHEN** a deprecated algorithm is used for the first time in a process
- **THEN** exactly one process warning with the algorithm's deprecation code SHALL be emitted

#### Scenario: Repeated use

- **WHEN** the same deprecated algorithm is used again in the same process
- **THEN** no further warning SHALL be emitted

### Requirement: Optional peer dependency loading

The bcrypt module SHALL be loaded only when a bcrypt operation is first invoked, in both the ESM and CJS builds and in both async and sync variants, and a missing module SHALL cause a `NodeCryptoError` with code `MISSING_PEER_DEPENDENCY` that names the package to install.

#### Scenario: bcrypt not installed

- **WHEN** a bcrypt operation runs and the module cannot be resolved
- **THEN** the call SHALL throw with code `MISSING_PEER_DEPENDENCY` and an installation hint

#### Scenario: Other namespaces unaffected

- **WHEN** bcrypt is not installed and a caller uses `digest`
- **THEN** the call SHALL succeed
