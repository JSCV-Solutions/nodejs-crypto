# Tasks

## 1. Constant-time equality with types, tests, and docs

- [x] 1.1 Add `CryptoInput` operand typings under `src/packages/comparison/typings/` via `import type` and implement `equals`/`equalsSync` on shared `toBytes` plus `node:crypto` `timingSafeEqual` with a length-mismatch `false` gate, and verify `pnpm typecheck` passes.
- [x] 1.2 Add `tests/comparison/equals.test.ts` covering fixed public fixtures (equal, same-length mismatch, empty/empty, cross-container string/Buffer/Uint8Array equivalence, UTF-8 multibyte, length mismatch, long pair differing only in the final byte), `INVALID_ARGUMENT` for non-`CryptoInput` operands with no operand bytes in messages, and async/sync result and error parity, and verify `pnpm test -- tests/comparison/equals.test.ts` passes.
- [x] 1.3 Document `equals`/`equalsSync` with JSDoc (operand types, boolean result, length-mismatch `false`, `INVALID_ARGUMENT` behavior, constant-time guarantee via `timingSafeEqual`) and the docs-site entries the change owes, and verify the documented signatures match the implemented overloads.

## 2. Namespace wiring and release readiness

- [x] 2.1 Wire `src/packages/comparison/index.ts` to export only `equals` and `equalsSync` (removing the placeholder), keep `tests/` mirroring runtime modules with no tests for pure `.d.ts` files, and verify `pnpm test` passes for the whole suite.
- [x] 2.2 Run the integration gate `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm smoke`, plus `openspec validate --all --strict`, and verify every command is green before review.
