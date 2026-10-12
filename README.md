# Node.js Crypto

Ready-to-use cryptographic utility package for Node.js applications.

## Scripts

| Command                                                   | Purpose                                                                                                        |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm audit:prod`                                         | Fail on high or critical findings in production dependencies                                                   |
| `pnpm build`                                              | Emit ESM to `dist/esm` and CJS to `dist/cjs`, then write per-format `package.json` files                       |
| `pnpm format:check`                                       | Verify Prettier formatting (`pnpm format` fixes)                                                               |
| `pnpm lint`                                               | Run ESLint with strict type-checked rules, plus Prettier formatting as a lint rule                             |
| `pnpm smoke`                                              | Verify every exported subpath loads from built output via both `import` and `require` (run after `pnpm build`) |
| `pnpm test`                                               | Run the Node.js built-in test runner on `tests/**/*.test.ts` directly against TypeScript sources               |
| `pnpm typecheck`                                          | Type-check sources with TypeScript 7.0.2 (`tsc`)                                                               |
| `npx @fission-ai/openspec@1.14.0 validate --all --strict` | Validate OpenSpec specs and changes (must pass before archiving)                                               |

## Toolchain

TypeScript 7.0.2 is the compiler: the `typescript-7` dependency
provides `tsc`, used by `typecheck` and both builds.
The bare `typescript` specifier
resolves to a TypeScript 6 compatibility package (`@typescript/typescript6`)
because TypeScript 7 exposes no JavaScript compiler API;
typed ESLint rules run against the compatibility package.
Sources use erasable syntax only and import relatives with `.ts` extensions,
which `rewriteRelativeImportExtensions` rewrites to `.js` in emitted output.

## Smoke test

`scripts/smoke-dist.mjs` (wired as `pnpm smoke`) loads every namespace subpath
declared in the `exports` map — `encryption`, `digest`,
`message-authentication`, `password-hashing`, `key-derivation`, `random`,
`comparison` — through package self-reference with both `import`
(ESM build in `dist/esm`) and `require` (CJS build in `dist/cjs`),
and checks each one resolves to its own namespace.
It needs built output, so the order is `pnpm build` then `pnpm smoke`;
it is intentionally separate from `pnpm test`,
which runs against TypeScript sources without a prior build.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contributor guide,
including the repository layout and code conventions.
Releases are tag-driven; see the [Releases](./CONTRIBUTING.md#releases)
procedure and dist-tags.

## Shared core

Internal behavior every namespace builds on (`src/shared/`,
mirrored by `tests/shared/`). These pages move into the Docusaurus
site with the documentation-site change; until then this section is
the user-facing reference.

### Error codes

Every error is a `NodeCryptoError` subclass carrying a stable `code`:

| Code                      | Class                        | When                                                  |
| ------------------------- | ---------------------------- | ----------------------------------------------------- |
| `INVALID_ARGUMENT`        | `InvalidArgumentError`       | Wrong argument type or range                          |
| `INVALID_ENCODING`        | `InvalidEncodingError`       | Text breaks the `hex`, `base64` or `base64url` rules  |
| `MISSING_PEER_DEPENDENCY` | `MissingPeerDependencyError` | Optional peer (for example `bcrypt`) is not installed |
| `UNSUPPORTED_ALGORITHM`   | `UnsupportedAlgorithmError`  | Algorithm identifier the function does not support    |

Messages never contain secrets, passwords, keys or plaintext.

### Encodings and inputs

Functions accept `string` (UTF-8), `Buffer` or `Uint8Array` with
identical results, and render binary data as `hex`, `base64` or
`base64url` text. Decoding is strict: malformed input throws
`INVALID_ENCODING` instead of being silently truncated.

### Deprecation warnings

Deprecated algorithms (for example `md5`, landing in a later change)
carry the JSDoc `@deprecated` tag and emit one `DeprecationWarning`
per process through `process.emitWarning`, with the stable code
`NODE_CRYPTO_DEPRECATED_<ALGORITHM>` (`md5` gives
`NODE_CRYPTO_DEPRECATED_MD5`).

### Peer loading

`bcrypt` stays an optional peer: it loads only when a bcrypt
operation first runs, in ESM and CJS builds and in async and `Sync`
variants. Sync loading uses a per-format file (`require-sync-esm.ts`
via `createRequire`, `require-sync-cjs.ts` via `require`) selected by
the `#sync-require` specifier, mapped per build through `tsconfig`
`paths` plus the `imports` maps in the root and per-tree
`package.json` files. A missing peer throws
`MISSING_PEER_DEPENDENCY` naming the package to install; every other
namespace works without it.
