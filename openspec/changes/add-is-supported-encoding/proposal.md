# Proposal

## Why

The `Encoding` union (`hex` | `base64` | `base64url`) is shared by every namespace that reads or writes binary data as text, but membership testing for it has no single home. `random` keeps a private `ReadonlySet<Encoding>` in `src/packages/random/bytes.ts`, and `digest` (backlog item 8) and `encryption` (backlog item 18) are expected to need the same test. Declaring the set per namespace invites drift. This change adds one shared assertion, `assertSupportedEncoding`, so the membership knowledge lives once in `src/shared/encodings.ts`.

## What Changes

- Add `assertSupportedEncoding(value)` to `src/shared/encodings.ts` as a TypeScript assertion function with signature `assertSupportedEncoding(value: unknown): asserts value is Encoding`, which throws an `InvalidArgumentError` for any value other than `'hex'`, `'base64'` or `'base64url'` (including non-strings and `undefined`) and returns `void` otherwise, narrowing the value to `Encoding` after the call.
- Record in the `shared-core` spec a requirement covering the assertion's throwing behavior and the `INVALID_ARGUMENT` code.
- Replace `random`'s private `supportedEncodings` set and its `assertEncoding` helper with a call to `assertSupportedEncoding` (delegation only; no change to accepted inputs, error messages, or the `INVALID_ARGUMENT` code). Because `random.bytes(length)` permits `undefined` to mean "no encoding requested", `random` guards `undefined` before calling the assertion.
- State the refinement path for `digest` and `encryption`: both SHALL call `assertSupportedEncoding` to validate any encoding argument instead of re-declaring the closed set.

## Capabilities

### New Capabilities

### Modified Capabilities

- `shared-core`: add a requirement for the shared encoding assertion `assertSupportedEncoding` (home, throwing shape raising `INVALID_ARGUMENT`, and the assertion-function narrowing contract).

## Impact

- New (or modified) code under `src/shared/encodings.ts` and `src/packages/random/bytes.ts`.
- New tests under `tests/shared/` (and an update to `tests/random/`).
- No new dependencies. No public API breaking change: `assertSupportedEncoding` is a new shared helper; the `Encoding` union and the `random` public surface are unchanged.
- Relationship to backlog: refines item 3 (`shared-core`, archived) with new work; consumed by item 6 (`random`) via delegation; consumed by items 8 (`digest`) and 18 (`encryption`) when those contracts are written.
