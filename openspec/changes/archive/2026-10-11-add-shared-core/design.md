# Design

## Context

Node.js ships the primitives, but the library adds a uniform surface. The optional bcrypt peer must resolve from the consumer's installation and must load synchronously for the `Sync` variants.

## Goals / Non-Goals

**Goals:**

- One error model, one input and encoding model, predictable names.

**Non-Goals:**

- Streaming interfaces, browser support.

## Decisions

- **Errors.** A base class with a readonly `code` and `cause` support. Codes are part of the public contract and documented. Rejected: error subclasses without codes, which are brittle across realms.
- **Encodings.** A single internal encode/decode module used by every namespace so behavior cannot diverge.
- **Deprecation warnings.** `process.emitWarning` with a type and code, guarded by a module-level set. Rejected: `console.warn`, which cannot be filtered with `--no-warnings` or `--disable-warning`.
- **Peer loading.** Async paths use dynamic `import()`. Sync paths need a synchronous `require`: ESM needs `createRequire` based on its own file location, CJS has `require`. `import.meta` is not allowed in the CJS build, so a per-format loader file is required. The approach (per-format file selected by the two build configurations) is validated in the first task below before any bcrypt code is written.

## Spike result (task 1.1, validated 2026-10-09)

Proved with `pnpm build` plus a script that sync- and async-loads the
`bcrypt` peer from the ESM build, the CJS build and the TypeScript
sources (under the `development` import condition):

- Two per-format files share one export name, `loadSyncPeer`:
  `src/shared/require-sync-esm.ts` (`createRequire(import.meta.url)`)
  and `src/shared/require-sync-cjs.ts` (module-scoped `require`).
- `src/shared/peer-loading.ts` imports the `#sync-require` specifier.
  `tsconfig` `paths` map it per program (ESM/typecheck to the ESM
  file, CJS build to the CJS file) and each build `exclude`s the other
  file, so `import.meta` never enters the CJS program (plain `.ts`
  files are used; `.mts`/`.cts` were rejected because the CJS build
  still rejects `import.meta` in `.mts` (TS1343) and `export function`
  in `.cts` under `verbatimModuleSyntax` (TS1287)).
- Runtime resolution uses `imports` maps: the root `package.json` maps
  `#sync-require` by condition (`development` to the ESM source for
  tests running on sources, `import`/`require` to the built files), and
  `scripts/write-dist-package-json.mjs` writes a per-tree mapping into
  each `dist/*/package.json`, because the nested `package.json` files
  shadow the root map for files under `dist/`.
- A missing peer throws `MissingPeerDependencyError` from both the sync
  and async paths in every context; unrelated load failures propagate
  unchanged. Rejected: a single `cwd`-anchored loader (resolves from
  the process instead of the library file) and hiding `import.meta`
  behind `eval` or stack-trace parsing.

## Risks / Trade-offs

- Per-format loader files add a small amount of build complexity. The spike task decides the final mechanism.
