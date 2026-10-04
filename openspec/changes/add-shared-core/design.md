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

## Risks / Trade-offs

- Per-format loader files add a small amount of build complexity. The spike task decides the final mechanism.
