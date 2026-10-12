# Proposal

## Why

Type declarations currently live inside runtime modules, so the type
surface each namespace exposes is scattered and hard to review. As the
seven namespaces land, one predictable home for interfaces and type
aliases keeps types discoverable for humans and coding agents
and stops the same shape from being redeclared in two places.

## What Changes

- Establish the layout rule for the whole `src/` tree: for a runtime
  module at `<area>/<name>.ts`, its interfaces and type aliases live in
  `<area>/typings/<name>.d.ts`; classes stay in the runtime module.
- Relocate the existing shared declarations (`ErrorCode`, `Encoding`,
  `CryptoInput` and any others found during design) into mirroring
  `src/shared/typings/*.d.ts` files, imported with `import type`.
- Keep every subpath export, runtime behavior and public type unchanged:
  the move is organizational only.
- Out of scope: runtime behavior changes, new algorithms, published
  subpath changes, and toolchain changes (test runner, compiler
  options).

## Capabilities

### New Capabilities

- `source-layout`: how source files are organized across the whole
  `src/` tree (runtime modules, mirroring `typings/` declarations,
  and how tests mirror them).

### Modified Capabilities

## Impact

- Source moves: `src/shared/*.ts` declarations to
  `src/shared/typings/*.d.ts`; every future package follows the rule
  from creation.
- Build and tests: `tsc` programs gain `.d.ts` inputs and the test
  runner resolves them through type stripping; the design spikes whether
  published declarations still resolve for consumers.
- Docs: `CONTRIBUTING.md` (repository layout and code conventions)
  and README structure reference, the new `source-layout` spec, and
  `DEVELOPMENT_PLAN.md` (sections 3 and 4 plus a section 9 assumption;
  section 6 stays untouched).
- No new dependencies. No public API change.
