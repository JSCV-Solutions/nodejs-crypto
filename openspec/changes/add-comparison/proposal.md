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
- Fix the build so package-local `typings/` folders ship with the published output. The build copied only `src/shared/typings`, so `random`'s `IntegerOptions` never reached `dist` and consumer type-checking failed with `TS2307` (already published in `1.0.0-rc.2`).
- Extend the smoke test to type-check a generated consumer program against the published declarations of every subpath, in both the ESM and the CJS tree, so a missing declaration file fails the build instead of a consumer's project.
- No new dependencies. No hand-rolled comparison loops. No new error codes or encodings.

## Capabilities

### New Capabilities

- `comparison`: constant-time byte equality including input types, length-mismatch behavior, error codes, and async/sync parity.

### Modified Capabilities

- `source-layout`: a namespace entry point exports only the type declarations that namespace owns; a shared type is never re-exported by a namespace.
- `repository-tooling`: the build copies every `typings/` folder into each output tree, and the smoke test type-checks the published declarations of every subpath.

## Impact

- Affected code: `src/packages/comparison/` (replaces the repository-tooling placeholder), `tests/` mirrors for the new runtime modules. The namespace declares no types of its own and consumes the shared `CryptoInput` operand type via `import type`.
- Build and tooling: `scripts/write-dist-package-json.mjs` copies every `typings/` folder under `src/` into each output tree; `scripts/smoke-dist.mjs` type-checks the published declarations of every subpath.
- Public API: new `comparison` subpath export only; no changes to existing exports. The `random` namespace keeps exporting its own `IntegerOptions`, which now reaches consumers.
- Dependencies, build, release: no new dependencies. No breaking changes. Out of scope: `digest`, `message-authentication` (consumes this namespace later but is not built here), `password-hashing`, `key-derivation`, `encryption`, and the docs site beyond JSDoc for the new functions.
