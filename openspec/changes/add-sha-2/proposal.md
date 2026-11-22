# Proposal

## Why

The `digest` namespace contract (change `add-digest-contract`) validates inputs, dispatches by algorithm, encodes output, and guarantees async/sync parity, but every algorithm case — including SHA-256 and SHA-512 — still throws `UnsupportedAlgorithmError`. Callers therefore cannot compute a SHA-2 digest yet, even though `sha-256` and `sha-512` are advertised in the `DigestAlgorithm` union and required for downstream consumers (HMAC in `add-message-authentication`, password hashing, and encryption). This change implements the two SHA-2 algorithms so the advertised contract becomes usable, while leaving MD5 to its own change.

## What Changes

- Add the `sha-2` capability: SHA-256 and SHA-512 computation under the existing `digest` namespace, delegated to `node:crypto` `createHash`.
- Replace the placeholder dispatch cases for `'sha-256'` and `'sha-512'` in `src/packages/digest/hash.ts` with concrete computation; the `'md5'` case keeps throwing `UnsupportedAlgorithmError` until `add-md5` lands.
- Support Buffer output by default and `hex`/`base64`/`base64url` text on request, reusing the shared `encodeBytes` helper, with identical results and error codes for the async and sync variants.
- Known-answer test vectors from FIPS 180-4 (NIST) for both algorithms, including empty input, single-block and multi-block messages, in `tests/digest/hash.test.ts`.
- JSDoc updates for `hash`/`hashSync` describing SHA-256/SHA-512 support and the pending MD5 case.

## Capabilities

### New Capabilities

- `sha-2`: SHA-256 and SHA-512 digest computation — accepted input types, output encodings, known-answer vectors, error codes, async/sync parity, and the approved-provider constraint.

### Modified Capabilities

- None. The `digest` spec's generic contract (validation, dispatch, encodings, error hygiene, parity) is unchanged; SHA-specific behavior is owned entirely by the new `sha-2` capability, consistent with the plan's "one capability per change" rule. The digest spec's "until that capability lands" clause remains accurate for MD5.

## Impact

- Affected code: `src/packages/digest/hash.ts` (the validation preamble captures the normalized bytes once via `toBytes` and each case computes its digest from them), `tests/digest/hash.test.ts` (vector and parity tests).
- Public API: no new exports; `./digest` already exposes `hash`/`hashSync`/`DigestAlgorithm`. Behavior changes only for `'sha-256'` and `'sha-512'`, which move from throwing `UNSUPPORTED_ALGORITHM` to returning a digest — a forward, non-breaking completion of an advertised identifier.
- No new dependencies, no new error codes, no new encodings, no changes to `shared-core`, `source-layout`, or `digest`'s public types.
- Out of scope: MD5 (change `add-md5`), HMAC (`add-message-authentication`), password hashing, key derivation, encryption, and the docs site beyond JSDoc.
