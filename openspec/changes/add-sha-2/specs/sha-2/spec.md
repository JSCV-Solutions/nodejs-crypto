# Spec Delta

## Purpose

Provides SHA-256 and SHA-512 digest computation behind the `digest` namespace, so callers can hash data under the two SHA-2 algorithms the library already advertises, with known-answer correctness verified against FIPS 180-4.

## ADDED Requirements

### Requirement: SHA-256 digest computation

The `sha-2` capability SHALL provide SHA-256 digests of `CryptoInput` through the `digest` namespace's `hash`/`hashSync` operation with algorithm identifier `'sha-256'`, as defined by FIPS 180-4 (Secure Hash Standard, SHA-256). The digest SHALL be 32 bytes and SHALL match the FIPS 180-4 known-answer vectors.

#### Scenario: Empty input

- **WHEN** a caller computes `hashSync('sha-256', '')` or `hash('sha-256', '')`
- **THEN** the result SHALL equal `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

#### Scenario: Single-block message

- **WHEN** a caller computes `hashSync('sha-256', 'abc')`
- **THEN** the result SHALL equal `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`

#### Scenario: Multi-block message

- **WHEN** a caller computes `hashSync('sha-256', 'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')`
- **THEN** the result SHALL equal `248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1`

#### Scenario: Encoded output decodes to the digest

- **WHEN** a caller requests `hashSync('sha-256', 'abc', 'hex')`, `'base64'` or `'base64url'`
- **THEN** the returned text SHALL strictly decode under that encoding to the 32 digest bytes

### Requirement: SHA-512 digest computation

The `sha-2` capability SHALL provide SHA-512 digests of `CryptoInput` through the `digest` namespace's `hash`/`hashSync` operation with algorithm identifier `'sha-512'`, as defined by FIPS 180-4 (Secure Hash Standard, SHA-512). The digest SHALL be 64 bytes and SHALL match the FIPS 180-4 known-answer vectors.

#### Scenario: Empty input

- **WHEN** a caller computes `hashSync('sha-512', '')` or `hash('sha-512', '')`
- **THEN** the result SHALL equal `cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e`

#### Scenario: Single-block message

- **WHEN** a caller computes `hashSync('sha-512', 'abc')`
- **THEN** the result SHALL equal `ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f`

#### Scenario: Multi-block message

- **WHEN** a caller computes `hashSync('sha-512', 'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu')`
- **THEN** the result SHALL equal `8e959b75dae313da8cf4f72814fc143f8f7779c6eb9f7fa17299aeadb6889018501d289e4900f7e4331b99dec4b5433ac7d329eeb6dd26545e96e55b874be909`

#### Scenario: Encoded output decodes to the digest

- **WHEN** a caller requests `hashSync('sha-512', 'abc', 'hex')`, `'base64'` or `'base64url'`
- **THEN** the returned text SHALL strictly decode under that encoding to the 64 digest bytes

### Requirement: Accepted input types

Data SHALL accept `CryptoInput` (`string` interpreted as UTF-8, `Buffer`, `Uint8Array`) per `shared-core`, normalizing through the shared `toBytes` helper, so equivalent bytes in different container types yield identical SHA-256 and SHA-512 digests.

#### Scenario: Equivalent containers

- **WHEN** the same bytes are passed as a UTF-8 string, a Buffer and a Uint8Array
- **THEN** every call SHALL return an equal digest for both `'sha-256'` and `'sha-512'`

#### Scenario: Multibyte strings hash by UTF-8 bytes

- **WHEN** a caller hashes `'é'` under `'sha-256'` or `'sha-512'`
- **THEN** the input SHALL be interpreted as its UTF-8 byte sequence

### Requirement: Async and sync variant parity

`hash` and `hashSync` SHALL return equal results and throw equal error codes for equal inputs for both `'sha-256'` and `'sha-512'`, the async variant wrapping the same synchronous primitive.

#### Scenario: Result parity

- **WHEN** `hash(a, b)` and `hashSync(a, b)` are called with the same arguments
- **THEN** both SHALL return an equal digest

#### Scenario: Error parity

- **WHEN** both variants receive the same invalid argument
- **THEN** both SHALL throw a `NodeCryptoError` with the same code

### Requirement: MD5 remains unsupported

The `'md5'` algorithm identifier SHALL continue to throw an `UnsupportedAlgorithmError` with code `UNSUPPORTED_ALGORITHM` until the `add-md5` change lands; this capability SHALL NOT implement MD5.

#### Scenario: MD5 not yet implemented

- **WHEN** a caller computes `hashSync('md5', 'abc')` or `hash('md5', 'abc')`
- **THEN** the call SHALL throw with code `UNSUPPORTED_ALGORITHM`

### Requirement: Approved cryptographic provider only

SHA-256 and SHA-512 computation SHALL be delegated to `node:crypto` `createHash` with the identifiers `'sha-256'` and `'sha-512'`, and SHALL NOT use any other cryptographic provider or hand-rolled primitive.

#### Scenario: No non-provider dependency

- **WHEN** the digest module is inspected
- **THEN** it SHALL import cryptographic primitives only from `node:crypto`

### Requirement: Error message hygiene

Every error thrown while computing a SHA-2 digest SHALL be a `NodeCryptoError` with a stable code and SHALL NOT include data or digests in its message.

#### Scenario: No secret echo

- **WHEN** any SHA-2 digest call fails validation
- **THEN** the error message SHALL use a fixed description of the violated rule with no input value interpolated
