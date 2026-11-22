# Tasks

## 1. DigestAlgorithm type declaration

- [x] 1.1 Create `src/packages/digest/typings/digest.d.ts` exporting `DigestAlgorithm = 'md5' | 'sha-256' | 'sha-512'` and verify `pnpm typecheck` passes.
- [x] 1.2 Confirm the new typings folder is copied into both output trees by `scripts/write-dist-package-json.mjs` (existing behavior) and verify a built consumer can import `DigestAlgorithm` from `@jscv-solutions/node-crypto/digest`.

## 2. hash and hashSync contract implementation

- [x] 2.1 Implement `hashSync(algorithm, data, encoding?)` in `src/packages/digest/hash.ts`: validate `algorithm` via `assertSupportedAlgorithm`, `data` via `toBytes`, and `encoding` via `assertSupportedEncoding` when present; dispatch on `algorithm` with each case throwing `UnsupportedAlgorithmError` (placeholder for `add-sha-2` / `add-md5`); return a `Buffer` when no encoding is given and encoded text otherwise, and verify `pnpm typecheck` passes.
- [x] 2.2 Implement `hash(algorithm, data, encoding?)` as an `async` function wrapping the same validation and dispatch path so results and error codes match `hashSync` exactly, and verify async/sync parity for every invalid-input class.
- [x] 2.3 Replace the repository-tooling placeholder in `src/packages/digest/index.ts` with re-exports of `hash` and `hashSync` from `./hash.ts` plus `export type { DigestAlgorithm } from './typings/digest.js'`, and verify the namespace exposes no other declaration.
- [x] 2.4 Document `hash` and `hashSync` with JSDoc (algorithm, data and encoding parameters, Buffer-vs-text return, `INVALID_ARGUMENT` / `UNSUPPORTED_ALGORITHM` behavior, constant-time-free note that hashing is deterministic) and verify the documented signatures match the implemented overloads.

## 3. Contract tests

- [x] 3.1 Add `tests/digest/hash.test.ts` covering Buffer output by default, each supported encoding round-tripping to the digest bytes, cross-container equivalence (string/Buffer/Uint8Array), UTF-8 multibyte input, `INVALID_ARGUMENT` for non-`CryptoInput` data and unsupported encodings, `UNSUPPORTED_ALGORITHM` for unknown identifiers and for each declared `DigestAlgorithm` (not yet implemented), and async/sync result and error parity, and verify `pnpm test -- tests/digest/hash.test.ts` passes.
- [x] 3.2 Assert error messages never echo data, digests or encodings, and verify the hygienic-message checks pass.
- [x] 3.3 Note that known-answer vectors are intentionally absent here: they are added by `add-sha-2` (SHA-256, SHA-512) and `add-md5` (MD5), which replace the placeholder dispatch cases.

## 4. Integration gate

- [x] 4.1 Run `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm build`, `pnpm smoke`, `pnpm fallow` and `openspec validate --all --strict`, and verify every command is green before review.
