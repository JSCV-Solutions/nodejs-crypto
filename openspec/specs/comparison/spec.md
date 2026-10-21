# comparison Specification

## Purpose

Provides constant-time byte equality for secrets, MACs, tags, and hashes so callers never leak prefix information through early-exit comparison.

## Requirements

### Requirement: Constant-time equality

The `comparison` capability SHALL provide `equals` (async) and `equalsSync` (sync) that return `true` when two operands hold identical bytes and `false` otherwise, comparing same-length inputs in constant time via `node:crypto` `timingSafeEqual` (Node.js crypto documentation; mitigates CWE-208 Observable Timing Discrepancy).

#### Scenario: Equal operands

- **WHEN** a caller awaits `equals('abc', 'abc')` or calls `equalsSync('abc', 'abc')`
- **THEN** the call SHALL return `true`

#### Scenario: Same-length differing operands

- **WHEN** a caller compares two same-length values differing in any byte
- **THEN** the call SHALL return `false`

#### Scenario: Empty operands

- **WHEN** a caller compares two empty inputs (`equals('', '')`)
- **THEN** the call SHALL return `true`

### Requirement: Accepted input types

Both operands SHALL accept `CryptoInput` (`string` interpreted as UTF-8, `Buffer`, `Uint8Array`) per `shared-core`, normalizing through the shared `toBytes` helper so equal bytes in different container types compare equal (Node.js `Buffer` encodings for the string interpretation).

#### Scenario: Equivalent containers

- **WHEN** the same bytes are passed as a UTF-8 string, a Buffer, and a Uint8Array
- **THEN** every pairwise comparison SHALL return `true`

#### Scenario: Multibyte strings compare by UTF-8 bytes

- **WHEN** a caller compares `'é'` with its UTF-8 Buffer form
- **THEN** the call SHALL return `true`

### Requirement: Length-mismatch behavior

Comparisons of operands with differing byte lengths SHALL return `false` instead of throwing, because lengths of stored hashes, tags, and MACs are not secret (consistent with `node:crypto` `timingSafeEqual` length precondition, Node.js crypto documentation).

#### Scenario: Different lengths

- **WHEN** a caller compares `'abc'` with `'abcd'`
- **THEN** the call SHALL return `false`

#### Scenario: Empty versus non-empty

- **WHEN** a caller compares `''` with any non-empty input
- **THEN** the call SHALL return `false`

### Requirement: Invalid arguments

Operands of any type outside `CryptoInput` (including `null`, `undefined`, numbers, and objects) SHALL cause both variants to throw a `NodeCryptoError` with code `INVALID_ARGUMENT` (follows `shared-core` error model).

#### Scenario: Wrong operand type

- **WHEN** a caller passes a non-`CryptoInput` operand such as `equals(123 as never, 'abc')`
- **THEN** both variants SHALL throw with code `INVALID_ARGUMENT`

### Requirement: Error message hygiene

Every error thrown by the `comparison` capability SHALL be a `NodeCryptoError` with a stable code and SHALL NOT include operand bytes, passwords, keys, or plaintext in its message (follows `shared-core` error model).

#### Scenario: No secret echo

- **WHEN** any `comparison` call fails validation
- **THEN** the error message SHALL use a fixed description of the violated rule with no operand value interpolated

### Requirement: Async and sync variant parity

`equals` and `equalsSync` SHALL return equal results and throw equal error codes for equal inputs (follows `shared-core` async and sync variants; the async variant wraps the same synchronous primitive).

#### Scenario: Result parity

- **WHEN** `equals(a, b)` and `equalsSync(a, b)` are called with the same operands
- **THEN** both SHALL return the same boolean

#### Scenario: Error parity

- **WHEN** both variants receive the same invalid operand
- **THEN** both SHALL throw a `NodeCryptoError` with the same code

### Requirement: Approved cryptographic provider only

All equality decisions for same-length inputs SHALL be delegated to `node:crypto` `timingSafeEqual` (Node.js crypto documentation); the capability SHALL NOT use early-exit comparison (`===`, `Buffer.equals`) or any hand-rolled constant-time loop.

#### Scenario: No early-exit dependency

- **WHEN** two long same-length operands differ only in their final byte
- **THEN** the result SHALL still be `false` via the constant-time primitive rather than a prefix short-circuit
