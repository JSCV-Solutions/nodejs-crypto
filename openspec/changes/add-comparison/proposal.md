# Proposal

## Why

Secrets, MACs, tags, and hashes must be compared in constant time, otherwise early-exit equality (`===`, `Buffer.equals`) leaks prefix information through timing. The library needs a dedicated `comparison` namespace now so `message-authentication` verification (change 10) and password-hash verification (changes 15+) have a single audited primitive to build on instead of each inventing its own check.

## What Changes

- Add the `comparison` namespace (`@jscv-solutions/node-crypto/comparison`) with one operation in two variants, backed only by `node:crypto` `timingSafeEqual`:
    - `equals(first, second): Promise<boolean>` and `equalsSync(first, second): boolean`.
    - Both accept `CryptoInput` (`string` interpreted as UTF-8, `Buffer`, `Uint8Array`) for each operand and return whether the byte sequences are equal.
    - Equal bytes return `true`; same-length differing bytes return `false`; differing byte lengths return `false` (lengths are not secret).
    - Operands of any other type (including `null`, `undefined`, numbers, objects) throw `NodeCryptoError` with code `INVALID_ARGUMENT`; messages never echo operand bytes.
- Keep full `shared-core` variant parity: async and sync variants return equal results and throw equal errors for equal inputs (the async variant wraps the same synchronous primitive, unlike the `random` `uuid` exception).
- Export only the namespace's own declarations: `comparison` declares no types of its own, so it re-exports no type. The `CryptoInput` operand type stays internal to the library, consistent with every other namespace.
- No new dependencies. No hand-rolled comparison loops. No new error codes or encodings.

## Capabilities

### New Capabilities

- `comparison`: constant-time byte equality including input types, length-mismatch behavior, error codes, and async/sync parity.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/packages/comparison/` (replaces the repository-tooling placeholder), `tests/` mirrors for the new runtime modules. The namespace declares no types of its own and consumes the shared `CryptoInput` operand type via `import type`.
- Public API: new `comparison` subpath export only; no changes to existing exports.
- Dependencies, build, release: none. No breaking changes. Out of scope: `digest`, `message-authentication` (consumes this namespace later but is not built here), `password-hashing`, `key-derivation`, `encryption`, `random`, and the docs site beyond JSDoc for the new functions.
