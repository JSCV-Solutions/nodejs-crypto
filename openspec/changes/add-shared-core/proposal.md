# Proposal

## Why

Every namespace needs the same error model, encodings, input handling, sync/async convention, deprecation signalling and optional-peer loading. Defining them once avoids drift between algorithms.

## What Changes

- Define the error hierarchy with a base `NodeCryptoError` and stable string codes.
- Define supported encodings (`hex`, `base64`, `base64url`) and accepted input types (`string`, `Buffer`, `Uint8Array`).
- Define the async and `Sync` variant convention and algorithm identifier rules.
- Define how deprecated algorithms signal deprecation (JSDoc plus one runtime warning).
- Define lazy loading of the optional bcrypt peer dependency for both ESM and CJS and both sync and async paths.
- Out of scope: any algorithm implementation.

## Capabilities

### New Capabilities

- `shared-core`: cross-cutting behavior shared by all namespaces.

### Modified Capabilities

## Impact

- New code under `src/shared/` and its tests under `tests/shared/`.
- No new dependencies.
