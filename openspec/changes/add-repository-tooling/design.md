# Design

## Context

TypeScript 7.0.2 is the native compiler and does not expose the JavaScript compiler API. Tools that rely on that API (typed ESLint rules, TypeDoc) only work through a TypeScript 6 compatibility package. typescript-eslint also declares support only for TypeScript below 6.1, so it must see the compatibility package.

## Goals / Non-Goals

**Goals:**
- Exact, reproducible versions; fast local feedback; both module formats verified to load.

**Non-Goals:**
- Bundling, minification, browser support, coverage thresholds.

## Decisions

- **Compiler pair.** `typescript-7` is an alias of `typescript@7.0.2` (provides `tsc`) and `typescript` is an alias of `@typescript/typescript6` (provides `tsc6`). Rejected: TypeScript 6 only (user wants 7.0.2 pinned), TypeScript 7 only (breaks typed lint and TypeDoc).
- **Two `tsc` builds, no bundler.** ESM uses `module: nodenext`; CJS uses `module: commonjs` with `moduleResolution: bundler` and `verbatimModuleSyntax: false`. Each output directory receives a `package.json` with its `type` so Node.js interprets it correctly. Rejected: bundlers such as tsdown (need the JS compiler API) and `.cts` duplicate sources.
- **Tests run on sources.** Node.js strips types natively, so source imports use `.ts` extensions and `rewriteRelativeImportExtensions` rewrites them to `.js` in emitted files. `erasableSyntaxOnly` keeps sources compatible with type stripping (no enums, namespaces or parameter properties).
- **Layout.** `src/packages/<namespace>/` for namespaces, `src/shared/` for shared code, `tests/` mirroring `src/packages/`, `docs/` as the workspace member. One file per algorithm.
- **No root export.** Subpath exports keep the optional bcrypt peer from loading unless the consumer imports `password-hashing`.
- **Verified.** A stub library was type-checked, built to ESM and CJS with TypeScript 7.0.2, and loaded by Node.js in both formats while writing this design.

## Risks / Trade-offs

- typescript-eslint and ESLint core may lag TypeScript 7, so the compatibility package must stay installed. Re-check support when upgrading.
- Dependabot may not handle the two aliased TypeScript entries consistently. Verify its pull requests keep both pins aligned.
- Consumers on legacy `moduleResolution: node10` cannot resolve subpath types. This is accepted.
