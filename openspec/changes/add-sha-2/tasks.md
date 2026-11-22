# Tasks

## 1. SHA-256 and SHA-512 computation

- [ ] 1.1 Import `createHash` from `node:crypto` in `src/packages/digest/hash.ts` and verify `pnpm typecheck` passes.
- [ ] 1.2 Capture the normalized bytes once with `const bytes = toBytes(data);` before the switch and reuse them in every case; replace the `'sha-256'` placeholder case with `createHash('sha-256').update(bytes).digest()`, returning the Buffer directly or `encodeBytes(digest, encoding)` when an encoding is given, and verify `hashSync('sha-256', 'abc')` returns `ba7816bf...`.
- [ ] 1.3 Replace the `'sha-512'` placeholder case the same way with `createHash('sha-512').update(bytes)`, and verify `hashSync('sha-512', 'abc')` returns `ddaf35a1...`.
- [ ] 1.4 Keep the `'md5'` case throwing `UnsupportedAlgorithmError` and verify `hashSync('md5', 'abc')` still throws with code `UNSUPPORTED_ALGORITHM`.
- [ ] 1.5 Update the top-of-file comment and JSDoc of `hash`/`hashSync` to describe SHA-256/SHA-512 support and the pending MD5 case, and verify the documented signatures match the implemented overloads.

## 2. Known-answer vectors and parity tests

- [ ] 2.1 Update `tests/digest/hash.test.ts` so `'sha-256'` and `'sha-512'` no longer assert `UnsupportedAlgorithmError`, and add FIPS 180-4 vectors (empty, `'abc'`, and one multi-block message per algorithm) asserting exact Buffer and hex output, and verify `pnpm test -- tests/digest/hash.test.ts` passes.
- [ ] 2.2 Add encoding round-trip assertions (`hex`, `base64`, `base64url`) for both algorithms and verify each decodes strictly to the digest bytes.
- [ ] 2.3 Add equivalent-container and multibyte UTF-8 assertions for both algorithms and verify identical digests across string/Buffer/Uint8Array.
- [ ] 2.4 Add async/sync result and error-code parity assertions for both algorithms and verify `pnpm test -- tests/digest/hash.test.ts` passes.
- [ ] 2.5 Retain the `'md5'` throws-`UnsupportedAlgorithmError` assertion and the unknown-algorithm/invalid-encoding/invalid-data assertions, and verify the full digest suite passes.

## 3. Integration gate

- [ ] 3.1 Run `pnpm typecheck`, `pnpm test`, `pnpm lint`, `pnpm format:check` and verify all are green.
- [ ] 3.2 Run `pnpm build`, `pnpm smoke` and verify the built `./digest` subpath type-checks under both `import` and `require`.
- [ ] 3.3 Run `pnpm fallow` and verify no dead code, duplication or complexity regressions are reported.
- [ ] 3.4 Run `openspec validate --all --strict` and verify it passes.
