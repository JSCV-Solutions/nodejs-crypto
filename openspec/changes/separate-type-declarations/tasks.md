# Tasks

## 1. Spike

- [ ] 1.1 Prove how input `.d.ts` files reach `dist/` (build and inspect whether `tsc` re-emits them; if missing, extend the dist-writing step to copy them) and that a consumer typecheck against `dist/` resolves the relocated types, documenting the result in the design

## 2. Implementation

- [ ] 2.1 Move `ErrorCode` to `src/shared/typings/errors.d.ts` with its JSDoc, switch `errors.ts` to `import type`, and verify `pnpm typecheck` passes
- [ ] 2.2 Move `Encoding` to `src/shared/typings/encodings.d.ts` and `CryptoInput` to `src/shared/typings/inputs.d.ts` with their JSDoc, switch both runtime modules to `import type`, and verify `pnpm typecheck` passes
- [ ] 2.3 Confirm no other `src/` module exports interfaces or type aliases needing relocation, and verify with `pnpm lint` that no new violations appear

## 3. Tests

- [ ] 3.1 Run the full suite with `pnpm test` (type stripping over the relocated imports) and verify all tests pass unmodified, proving no runtime test counterpart is needed for `.d.ts` files
- [ ] 3.2 Rebuild both formats with `pnpm build`, run `pnpm smoke`, and verify each `dist/` tree carries its typings declarations with consumer type resolution intact

## 4. Documentation

- [ ] 4.1 Document the `typings/` mirroring rule in `CONTRIBUTING.md` (repository layout and code conventions, including the standing rule that closed sets are string-literal unions rather than `enum` declarations) and the README structure reference, and verify `pnpm format:check` passes on the edited docs
- [ ] 4.2 Update `DEVELOPMENT_PLAN.md` section 3 repository layout tree and section 4 toolchain paragraph to describe the implemented `typings/` rule, record the unions-instead-of-enums convention in the section 9 assumptions, and verify the updated sections match the new tree
- [ ] 4.3 Run `npx @fission-ai/openspec@1.14.0 validate --all --strict` and verify it passes before archiving
