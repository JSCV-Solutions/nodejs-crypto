# Tasks

## 1. Implement the shared assertion

- [ ] 1.1 Add `assertSupportedEncoding(value: unknown): asserts value is Encoding` to `src/shared/encodings.ts`, throwing `InvalidArgumentError` for any value other than `'hex'`, `'base64'` or `'base64url'` (including non-strings and `undefined`) and returning `void` otherwise, and export it; verify `pnpm typecheck` passes and the export is reachable from `src/shared/encodings.ts`
- [ ] 1.2 Add JSDoc to `assertSupportedEncoding` (description, `@param`, note that it throws `INVALID_ARGUMENT` and narrows the value to `Encoding`); verify the doc renders in TypeDoc output

## 2. Delegate random to the shared assertion

- [ ] 2.1 Replace the private `supportedEncodings` set and `assertEncoding` helper in `src/packages/random/bytes.ts` with a call to `assertSupportedEncoding`, guarding `undefined` before the call; verify `pnpm typecheck` passes
- [ ] 2.2 Update the import in `src/packages/random/bytes.ts` to bring in `assertSupportedEncoding` from `../../shared/encodings.ts`; verify no unused-import lint errors (`pnpm lint`)

## 3. Tests

- [ ] 3.1 Add `tests/shared/encodings.test.ts` cases for `assertSupportedEncoding` covering the three supported strings (no throw, narrowing), unsupported strings (throws `INVALID_ARGUMENT`), non-string values including `null` and `undefined` (throws `INVALID_ARGUMENT`), and absence of throws for supported values; verify `node --test` passes
- [ ] 3.2 Run the existing `tests/random/bytes.test.ts` unchanged and verify it still passes after delegation

## 4. Documentation and refinement path

- [ ] 4.1 Note in `DEVELOPMENT_PLAN.md` (or the change's design) that `digest` and `encryption` must call `assertSupportedEncoding` from `src/shared/encodings.ts` instead of re-declaring a closed set; verify the reference is present

## 5. Integration checks

- [ ] 5.1 Run `openspec validate --all --strict` and verify it passes
- [ ] 5.2 Run `pnpm typecheck` and `pnpm test` and verify both pass with no regressions
