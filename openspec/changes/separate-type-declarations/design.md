# Design

## Context

See proposal.md for motivation. Current state: the only declarations
in `src/` live inline in runtime modules — `ErrorCode` in
`src/shared/errors.ts`, `Encoding` in `src/shared/encodings.ts`,
`CryptoInput` in `src/shared/inputs.ts` (`deprecation.ts`,
`algorithms.ts`, `peer-loading.ts` and both `require-sync-*.ts` export
no types; the namespace `index.ts` files are scaffolds). Constraints:
`verbatimModuleSyntax` (type-only imports MUST use `import type`),
`isolatedModules` + `erasableSyntaxOnly` (only erasable syntax),
`rewriteRelativeImportExtensions` (relative imports
carry explicit extensions), dual ESM/CJS builds with declaration
output, and tests running on sources through Node type stripping.

## Goals / Non-Goals

**Goals:**

- One mechanical rule mapping every runtime module to its type home,
  applicable to future packages from creation.
- Zero change to subpath exports, runtime behavior and
  consumer-visible types.

**Non-Goals:**

- Changing the published subpath surface or the test runner.

## Decisions

- **Mirror paths.** `<area>/<name>.ts` owns `<area>/typings/<name>.d.ts`
  (interfaces, type aliases), imported relatively. Rejected: a single
  top-level `types/` folder, which separates declarations from the
  modules they describe.
- **`import type` at every use site.** Required by
  `verbatimModuleSyntax` and guarantees no runtime import of a file
  with no runtime. Rejected: value imports of types, which would emit
  a runtime dependency on declaration files.
- **JSDoc moves with the declaration.** The doc comment relocates into
  the `.d.ts` file so TypeDoc and editors show it at the type;
  function-level contracts stay on the runtime module.
- **Published declarations via a spike.** `tsc` checks `.d.ts` inputs
  but does not re-emit them, so the emitted per-module `.d.ts` files
  would reference `./typings/*.js` paths missing from `dist/`.
  (Verified 2026-10-11 with the repo's TypeScript 7.0.2 on a scratch
  project: only the `.js` and generated `.d.ts` are emitted, the input
  `.d.ts` is not copied, and the generated `.d.ts` keeps the dangling
  `./typings/*.js` import. No option under the TSConfig `Emit`
  reference copies declaration inputs to `outDir`.) The first task
  spikes the actual emit behavior and, if confirmed, extends the
  existing dist-writing step to copy the typings files so consumer
  type resolution keeps working. Rejected: re-exporting the types from
  runtime modules (defeats the separation) and leaving `dist/` without
  them (breaks consumers).

## Risks / Trade-offs

- [Risk] Input `.d.ts` files missing from `dist/` break consumer
  typechecks. Mitigation: the spike plus a copy step verified by a
  consumer-resolution check.
- [Risk] Type and runtime drift apart unnoticed (no lint rule links
  them). Mitigation: moves are pure relocations reviewed as diffs;
  `import type` keeps a compiler-enforced reference.
- [Risk] `tests/` mirroring confuses contributors when `typings/` has
  no test counterpart. Mitigation: the spec states tests mirror runtime
  modules only.

## Migration Plan

Pure relocation with no behavior change: move declarations, switch to
`import type`, run the full gates (`typecheck`, `test`, `lint`,
`format:check`, `build`, `smoke`, `validate --all --strict`). Rollback
is a revert of the move commits.

## Open Questions

None.
