# Tasks

## 1. Random bytes with types, tests, and docs

- [x] 1.1 Add `RandomBytesOptions`/encoding typings under `src/packages/random/typings/` via `import type` and implement `bytes`/`bytesSync` on `node:crypto` `randomBytes` through shared `encodeBytes`, and verify `pnpm typecheck` passes.
- [x] 1.2 Add `tests/random/bytes.test.ts` covering Buffer length and inequality, `hex`/`base64`/`base64url` round-trips, and `INVALID_ARGUMENT` for bad lengths and encodings plus async/sync error parity, and verify `pnpm test -- tests/random/bytes.test.ts` passes.
- [x] 1.3 Document `bytes`/`bytesSync` with JSDoc (return shapes, encoding option, errors, no `Math.random`) and the docs-site entry the change owes, and verify the documented signatures match the implemented overloads.

## 2. Bounded integers and UUIDs with tests and docs

- [x] 2.1 Implement `integer`/`integerSync` for `{ min?, max }` on `node:crypto` `randomInt` with `min` default `0`, safe-integer checks, and Node `RangeError` mapped to `INVALID_ARGUMENT`, and verify `pnpm typecheck` passes.
- [x] 2.2 Add `tests/random/integer.test.ts` covering bounds, default `min`, `INVALID_ARGUMENT` for empty/unsafe ranges, async/sync error parity, and independence from stubbed `Math.random`, and verify `pnpm test -- tests/random/integer.test.ts` passes.
- [x] 2.3 Implement sync-only `uuid()` on `node:crypto` `randomUUID`, add `tests/random/uuid.test.ts` asserting the RFC 9562 Section 4.1 version-4 grammar and inequality of successive values, and verify `pnpm test -- tests/random/uuid.test.ts` passes.
- [x] 2.4 Document `integer`/`integerSync`/`uuid` with JSDoc (options shape, `[min, max)` semantics, sync-only `uuid` exception, errors) and their docs-site entries, and verify the documented signatures match the implementation.

## 3. Namespace wiring and release readiness

- [x] 3.1 Wire `src/packages/random/index.ts` to export only `bytes`, `bytesSync`, `integer`, `integerSync`, and `uuid` (removing the placeholder), keep `tests/` mirroring runtime modules with no tests for pure `.d.ts` files, and verify `pnpm test` passes for the whole suite.
- [x] 3.2 Run the integration gate `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm smoke`, plus `openspec validate --all --strict`, and verify every command is green before review.
