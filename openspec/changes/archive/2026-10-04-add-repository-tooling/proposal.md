# Proposal

## Why

The repository has no build, quality or test tooling yet. Every later change (algorithms, release, docs) depends on a reproducible toolchain with exact versions, dual ESM/CJS output and enforced quality gates, so this has to be specified and built first.

## What Changes

- Pin the toolchain: Node.js >=24.7.0, PNPM 12.8.1, TypeScript 7.0.2 (exact versions, no ranges).
- Configure TypeScript 7.0.2 as the compiler and a TypeScript 6 compatibility package for tools that need the JavaScript compiler API (ESLint with typed rules, TypeDoc).
- Produce ESM and CJS builds with declaration files, exposed through subpath exports (one per namespace) and no root entry point.
- Add ESLint and Prettier with the project conventions, including a ban on `Math.random`.
- Add the Node built-in test runner executing TypeScript sources directly. No coverage threshold.
- Set up the PNPM workspace (library at the repository root, `docs/` as the second member).
- Out of scope: commit linting and hooks (add-commit-conventions), CI and release workflows (add-release-pipeline), Docusaurus content (documentation-site change), any cryptographic code.

## Capabilities

### New Capabilities

- `repository-tooling`: toolchain versions, compilation, package layout and exports, static quality gates and test execution for the library.

### Modified Capabilities

## Impact

- New files: `package.json`, `pnpm-workspace.yaml`, `tsconfig*.json`, `eslint.config.mjs`, `.prettierrc.json`, `.gitignore`, `scripts/`.
- Dev dependencies are added with exact versions. The only peer dependency is the optional `bcrypt`.
