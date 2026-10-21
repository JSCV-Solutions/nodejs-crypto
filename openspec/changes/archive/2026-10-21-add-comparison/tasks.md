# Tasks

## 1. Constant-time equality with types, tests, and docs

- [x] 1.1 Consume the shared `CryptoInput` operand type via `import type` and implement `equals`/`equalsSync` on shared `toBytes` plus `node:crypto` `timingSafeEqual` with a length-mismatch `false` gate, and verify `pnpm typecheck` passes.
- [x] 1.2 Export only the namespace's own declarations from `src/packages/comparison/index.ts` (no re-export of the shared `CryptoInput` type) and verify the namespace exposes no type of another module.
- [x] 1.3 Add `tests/comparison/equals.test.ts` covering fixed public fixtures (equal, same-length mismatch, empty/empty, cross-container string/Buffer/Uint8Array equivalence, UTF-8 multibyte, length mismatch, long pair differing only in the final byte), `INVALID_ARGUMENT` for non-`CryptoInput` operands with no operand bytes in messages, and async/sync result and error parity, and verify `pnpm test -- tests/comparison/equals.test.ts` passes.
- [x] 1.4 Document `equals`/`equalsSync` with JSDoc (operand types, boolean result, length-mismatch `false`, `INVALID_ARGUMENT` behavior, constant-time guarantee via `timingSafeEqual`) and the docs-site entries the change owes, and verify the documented signatures match the implemented overloads.

## 2. Namespace wiring and release readiness

- [x] 2.1 Wire `src/packages/comparison/index.ts` to export only `equals` and `equalsSync` (removing the placeholder), keep `tests/` mirroring runtime modules with no tests for pure `.d.ts` files, and verify `pnpm test` passes for the whole suite.
- [x] 2.2 Copy every `typings/` folder under `src/` into each output tree in `scripts/write-dist-package-json.mjs` so a namespace's own declarations reach `dist`, and verify the built `random` tree contains `packages/random/typings/integer.d.ts`.
- [x] 2.3 Extend `scripts/smoke-dist.mjs` to type-check a generated consumer program against the published declarations of every subpath under both the `import` and the `require` conditions, and verify the check fails when a declaration file is missing from the built tree.
- [x] 2.4 Run the integration gate `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm build`, and `pnpm smoke`, plus `openspec validate --all --strict`, and verify every command is green before review.
