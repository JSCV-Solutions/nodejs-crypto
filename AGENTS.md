# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Codex, OpenCode and others) working in this repository. Humans should follow them too.

## Project

`@jscv-solutions/node-crypto` is a public npm library of ready-to-use cryptography utilities for Node.js: authenticated encryption (AES-256-GCM), digests (MD5, SHA-256, SHA-512), HMAC, password hashing (bcrypt, PBKDF2, scrypt, Argon2), key derivation, secure random generation and constant-time comparison.

- Runtime: Node.js >=24.7.0 only. Output: ESM and CJS.
- Crypto provider: `node:crypto`. The only third-party crypto package is `bcrypt`, an optional, lazily loaded peer dependency.
- Repository: `JSCV-Solutions/nodejs-crypto`. License: MPL-2.0. Strict semver.

## Source of truth

1. `openspec/specs/` is the current behavior of the library. `openspec/changes/` holds proposed changes.
2. `DEVELOPMENT_PLAN.md` holds the decisions, API overview and change backlog.
3. `openspec/config.yaml` holds the project context and artifact rules that OpenSpec injects into planning.

Workflow: propose, review, apply, archive. Use `/opsx:propose` (Claude Code), `/opsx-propose` (Cursor, OpenCode) or `$openspec-propose` (Codex), then the matching `apply` and `archive` commands. Do not start implementing in the same step as proposing.

## Commands

```bash
pnpm install            # install (pnpm 12.8.1, Node >=24.7.0)
pnpm typecheck          # tsc (TypeScript 7.0.2), no emit
pnpm lint               # ESLint
pnpm format:check       # Prettier (use pnpm format to fix)
pnpm test               # Node built-in test runner on tests/**/*.test.ts
pnpm build              # ESM + CJS into dist/
pnpm audit:prod         # high and critical findings in production dependencies
npx @fission-ai/openspec@1.14.0 validate --all --strict
```

## Toolchain notes

- `tsc` is TypeScript 7.0.2 (package alias `typescript-7`). The bare `typescript` specifier is a TypeScript 6 compatibility package (binary `tsc6`) kept only for tools that need the JavaScript compiler API (typed ESLint rules, TypeDoc). Never use `tsc6` to build the library.
- Tests run directly on TypeScript sources through Node.js type stripping. Source files therefore import with `.ts` extensions and use only erasable syntax (no enums, namespaces or parameter properties).
- Do not edit generated OpenSpec tool files (`.claude/`, `.cursor/`, `.agents/`, `.opencode/` skills and commands). Regenerate them with `openspec update`.

## Repository layout

```
docs/                    Docusaurus site (workspace package, deployed on stable tags)
openspec/                specs, changes, config.yaml
src/packages/<name>/     one folder per namespace = one subpath export; one file per algorithm
src/shared/              errors, encodings, input handling, deprecation, peer loading
tests/                   mirrors src/packages/ and src/shared/
```

Namespaces: `encryption`, `digest`, `message-authentication`, `password-hashing`, `key-derivation`, `random`, `comparison`. Files and folders use kebab-case.

## Code conventions

- Functional exports only. No classes except error classes.
- Public API is minimal: the algorithm identifier chosen by the caller drives behavior.
- Identifiers are meaningful and not abbreviated, unless the abbreviation is the algorithm's own name (HMAC, AES, SHA, PBKDF2).
- Algorithm identifiers are lowercase kebab-case strings (`aes-256-gcm`, `sha-256`, `argon2id`).
- Every operation has an async function and a `Sync` variant with equal results and errors.
- Explicit type annotations on variables, parameters and return types; explicit member accessibility. Prettier: single quotes, no trailing commas.
- Every public function has JSDoc and an entry in the docs site.
- Errors extend `NodeCryptoError` and carry a stable string `code`. Messages never contain secrets or plaintext.

## Hard rules

1. Never edit cryptographic primitives or their parameters without an approved OpenSpec change.
2. Always run `pnpm typecheck` and `pnpm test` after changing source code.
3. Never add a dependency without explicit approval from the maintainer.
4. No hand-rolled primitives. Use `node:crypto` (bcrypt is the only exception).
5. Never log, print or include secrets, passwords, keys or plaintext in errors, warnings or comments.
6. Constant-time comparisons only for secrets, MACs, tags and hashes (`comparison` namespace or `timingSafeEqual`).
7. Never use `Math.random`. Use the `random` namespace or `node:crypto`.
8. No secrets in tests or fixtures. Public known-answer vectors from RFCs or NIST are allowed because they are published test data.
9. One capability per change.
10. `openspec validate --all --strict` must pass before archiving a change.
11. Default parameters may only be raised or kept equal in strength. Lowering one is a breaking change that needs a major release.
12. Do not bump versions, create tags or publish. Releases are manual and done by the maintainer.

## Security-sensitive behavior that must stay documented

- Argon2id is the default key derivation for encryption. A comment in the source and a section in the docs must say why.
- bcrypt silently truncates passwords longer than 72 bytes to stay compatible with bcrypt. A comment at the call site, the JSDoc and the docs must say so.
- MD5 is deprecated: JSDoc `@deprecated` plus one runtime process warning per process.
- bcrypt hashes use the modern `$2b$` prefix only.

## Commit messages

Follow `CONTRIBUTING.md` for the commit message format.

## Testing

- Node built-in test runner. Place tests in `tests/` mirroring the source path (`tests/encryption/aes-256-gcm.test.ts`).
- Every algorithm has known-answer vectors from the relevant RFC or NIST publication.
- Keep tests fast: use low-cost parameters unless a test targets the defaults. There is no coverage threshold.
