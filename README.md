# Node.js Crypto

Ready-to-use cryptographic utility package for Node.js applications.

## Scripts

| Command             | Purpose                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm audit:prod`   | Fail on high or critical findings in production dependencies                                                   |
| `pnpm build`        | Emit ESM to `dist/esm` and CJS to `dist/cjs`, then write per-format `package.json` files                       |
| `pnpm format:check` | Verify Prettier formatting (`pnpm format` fixes)                                                               |
| `pnpm lint`         | Run ESLint with strict type-checked rules, plus Prettier formatting as a lint rule                             |
| `pnpm smoke`        | Verify every exported subpath loads from built output via both `import` and `require` (run after `pnpm build`) |
| `pnpm test`         | Run the Node.js built-in test runner on `tests/**/*.test.ts` directly against TypeScript sources               |
| `pnpm typecheck`    | Type-check sources with TypeScript 7.0.2 (`tsc`)                                                               |

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

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the contributor guide.
