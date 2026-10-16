# Design

## Context

See proposal.md (Why) for motivation. Current state: `src/packages/random/index.ts` is a repository-tooling placeholder exporting a dummy `namespace` constant. Constraints: `node:crypto` is the only provider, erasable syntax with `.ts` import extensions, interfaces in `typings/` consumed via `import type`, functional exports only, and strict `INVALID_ARGUMENT` validation with hygienic messages. This is the first functional namespace, so it also sets the file-layout precedent later namespaces follow.

## Goals / Non-Goals

**Goals:**

- Map each operation to exactly one `node:crypto` CSPRNG primitive with no abstraction layer.
- Honor the approved API: `bytes`/`bytesSync` with Buffer-default plus encoding, `integer`/`integerSync` with `{ min?, max }`, sync-only `uuid`.
- Pre-validate every argument and surface all failures as `NodeCryptoError` codes.

**Non-Goals:**

- No new error codes, no new encodings, no changes to `shared-core` or `source-layout`.
- No password hashing, key derivation, or encryption helpers; no docs-site work beyond JSDoc (the site lands in change 20).

## Decisions

### Direct `node:crypto` mapping, no wrapper layer

Use async `randomBytes` for `bytes`, sync `randomBytes` for `bytesSync`, async/sync `randomInt` for `integer`/`integerSync`, and sync `randomUUID` for `uuid`. There are no default parameters to choose (an RNG takes no strength knobs), so no OWASP lookup applies; the justification source is the Node.js `node:crypto` documentation plus NIST SP 800-90Ar1 for the CSPRNG expectation.

- Rejected: WebCrypto `getRandomValues` indirection. No benefit in a Node-24-only library and a second provider surface to audit.
- Rejected: `Math.random` for any path. Insecure and explicitly forbidden by AGENTS.md rule 7.
- Rejected: hand-rolled generators. Forbidden by AGENTS.md rule 4 and unauditable.

### `bytes` returns `Buffer` by default, text on request

Overloads: `bytes(length): Promise<Buffer>`, `bytes(length, encoding): Promise<string>` (same for `bytesSync`), implemented by generating bytes once and passing them through the shared `encodeBytes` helper when an encoding is present.

- Rejected: string-only with default `hex`. Forces an encoding decision on binary-key callers and doubles memory churn for key material.
- Rejected: Buffer-only. Pushes `hex`/`base64`/`base64url` handling onto every caller and duplicates the already-tested shared encoder.

### `integer({ min?, max })` with `[min, max)` semantics

`min` defaults to `0`; both bounds must be safe integers with `min < max`. Semantics mirror `node:crypto` `randomInt` exactly so there is no translation layer to misread. The options object (chosen by the maintainer over positional args) keeps the call site explicit (`integer({ max: 6 })`) and leaves room for future non-breaking fields.

- Rejected: positional `integer(min, max)`. Easy to swap bounds silently; inconsistent with the explicit-options direction chosen for this API.
- Rejected: single-arg `integer(max)`. Ambiguous with the options form and a second spelling to document and test.

### Sync-only `uuid` as an explicit `shared-core` exception

`node:crypto` `randomUUID` performs no I/O, so an async wrapper would only add promise overhead and imply asynchrony that does not exist. The namespace therefore exposes `uuid()` only, with no `uuidSync` (there is no async original to suffix). The spec records this as the sanctioned reading of DEVELOPMENT_PLAN "`Sync` where meaningful".

- Rejected: `uuid` plus `uuidSync`/`async uuid` for strict parity. A promise wrapper around a sync call is misleading API.
- Rejected: naming the sync function `uuidSync` alone. Breaks the plan's indicative name and surprises callers.

### Validate first, map Node errors defensively

Pre-validate `length` (non-negative safe integer; `0` returns an empty buffer) and integer bounds before touching `node:crypto`, throwing `InvalidArgumentError` with fixed messages. Any `RangeError` escaping `node:crypto` (for example the `2^48` range limit on `randomInt`) is caught and re-thrown as `InvalidArgumentError` so callers only ever see stable codes.

- Rejected: passing arguments straight through. Leaks Node `RangeError`/`TypeError` and breaks the stable-code contract.
- Rejected: new error codes for range vs type failures. One `INVALID_ARGUMENT` code keeps the contract minimal; the message states which rule broke.

### No known-answer vectors for randomness

Unlike digests and HMACs, a CSPRNG has no fixed vectors to assert. Tests assert shape (byte length, integer bounds, UUID grammar), strict decoding of encoded output, error codes for each invalid class, sync/async error parity, and non-dependence on `Math.random` (stub it constant and show output still varies). Uniqueness assertions use 16+ bytes / UUIDs where collision probability is negligible, with format assertions first so a failure reads as a format bug, not a flake.

## Risks / Trade-offs

- [Uniqueness tests can flake in theory] → Mitigation: assert format and length first; use 128-bit values where collision probability is ~2^-128 per pair.
- [`randomInt` range ceiling (`max - min < 2^48`)] → Mitigation: pre-check safe integers and map residual Node `RangeError` to `INVALID_ARGUMENT`.
- [`base64` vs `base64url` padding confusion] → Mitigation: reuse shared `encodeBytes`/`isWellFormed` instead of reimplementing; test both padded and unpadded round-trips.
- [Parity wording vs `shared-core`] → Mitigation: spec explicitly redefines parity for randomness as shape/error parity, not value equality, and scopes the `uuid` exception to this capability.

## Migration Plan

No migration. This adds a new subpath export and replaces an internal placeholder that was never a published API. Rollback is deleting the new files. No version bump or tag from this branch (releases are manual per AGENTS.md rule 12).
