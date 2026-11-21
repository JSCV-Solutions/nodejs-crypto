# Proposal

## Why

The library ships no digest namespace yet: `src/packages/digest/index.ts` is still the repository-tooling placeholder, so callers have no way to compute MD5, SHA-256 or SHA-512 through the library's shared error, encoding and input contracts. `add-sha-2` (#9) and `add-md5` (#17) both depend on a stable `digest` capability, and `message-authentication` (#10) depends on it too, so the namespace contract must be locked first. Defining the contract now fixes the public signature, the `DigestAlgorithm` identifier set, the encoding and input behavior, and the error/parity rules that every later digest algorithm must honor.

## What Changes

- Add the `digest` capability (`@jscv-solutions/node-crypto/digest`) as a namespace contract:
    - `hash(algorithm, data, encoding?)` (async) and `hashSync(algorithm, data, encoding?)` (sync).
    - `algorithm` is a `DigestAlgorithm`: `'md5' | 'sha-256' | 'sha-512'`.
    - `data` is `CryptoInput` (`string` interpreted as UTF-8, `Buffer`, `Uint8Array`).
    - `encoding` is optional (`'hex'`, `'base64'`, `'base64url'`); when omitted the result is a `Buffer`, otherwise the encoded text.
    - Async and sync variants return equal results and throw equal error codes for equal inputs (async wraps the sync primitive).
- Validate every argument through the shared helpers: `toBytes` for data, `assertSupportedEncoding` for the encoding, `assertSupportedAlgorithm` for the algorithm. Failures surface as `InvalidArgumentError` (code `INVALID_ARGUMENT`) and `UnsupportedAlgorithmError` (code `UNSUPPORTED_ALGORITHM`); messages never echo data.
- Export the `DigestAlgorithm` type from the namespace's own `typings/` folder, consumed via `import type`.
- Replace the repository-tooling placeholder in `src/packages/digest/index.ts` with the real dispatch skeleton.
- The computation for each algorithm is intentionally **not** implemented here: every dispatch case throws an `UnsupportedAlgorithmError` until `add-sha-2` and `add-md5` replace it with real `node:crypto` computation. MD5's `@deprecated` tag and process warning are likewise deferred to `add-md5`.
- No new dependencies. No hand-rolled primitives. No changes to `shared-core` or `source-layout`.

## Capabilities

### New Capabilities

- `digest`: namespace contract for digests, including the `hash`/`hashSync` signatures, the `DigestAlgorithm` identifier set, accepted input types, optional output encodings, error codes, and async/sync parity.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/packages/digest/` (replaces the repository-tooling placeholder), `src/packages/digest/typings/` (new `DigestAlgorithm` declaration), `tests/digest/` (new mirror for the contract).
- Public API: new `digest` subpath export surface for `hash`, `hashSync` and the `DigestAlgorithm` type; no changes to existing exports.
- Dependencies, build, release: none. No breaking changes. Out of scope: the SHA-256/SHA-512 implementation and NIST vectors (`add-sha-2`), the MD5 implementation, its deprecation warning and its password-hashing form (`add-md5`), HMAC (`message-authentication`), and the docs site beyond JSDoc for the new functions.
