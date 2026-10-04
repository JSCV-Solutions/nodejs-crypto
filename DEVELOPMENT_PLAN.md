# Development plan: @jscv-solutions/node-crypto

A public npm library of ready-to-use cryptography utilities for Node.js, developed spec-first with OpenSpec 1.14.0. This plan records the confirmed decisions, the intended public API, the toolchain, the release flow and the ordered backlog of OpenSpec changes. Each backlog item becomes its own OpenSpec change; the plan itself contains no dates or milestones.

## 1. Confirmed decisions

**Package and distribution**
- Name `@jscv-solutions/node-crypto`, public npm, license MPL-2.0, author `JSCV Solutions`, repository `JSCV-Solutions/nodejs-crypto`.
- Strict semver. First release `1.0.0`. The maintainer bumps `package.json` by hand and pushes a `v*.*.*` tag.
- Node.js 24.7.0 or newer only (Argon2 in `node:crypto` needs it). PNPM 12.8.1. TypeScript 7.0.2, pinned exactly.
- `node:crypto` is the only provider. bcrypt (the `bcrypt` package) is an optional, lazily loaded peer dependency.

**API shape**
- Functional exports in meaningful, non-abbreviated namespaces, published as subpath exports (lazy loading, no root entry).
- Lowercase kebab-case algorithm identifiers. Async and `Sync` variants. Custom error classes with stable codes. ESM and CJS.
- Minimal public API: the algorithm the caller passes selects the behavior.

**Algorithms in 1.0.0**
`aes-256-gcm`, `md5` (deprecated, also usable for password hashing), `sha-256`, `sha-512`, `bcrypt` (modern `$2b$` only), `pbkdf2`, `scrypt`, `argon2id`, `argon2i`, `argon2d`, plus HMAC, secure random generation and timing-safe comparison. More algorithms are planned later but not specified.

**Encryption**
- Inputs: string, Buffer or Uint8Array. Key: password or raw 32-byte key. Optional AAD.
- Password-based key derivation may use `argon2id` (default), `scrypt` or `pbkdf2`. KDF parameters are stored with the ciphertext.
- `encrypt` always returns a typed object and `decrypt` accepts only that object. Binary fields are encoded strings (default `hex`; also `base64`, `base64url`). `decrypt` returns a UTF-8 string by default, or a Buffer on request.
- No key rotation or versioning in 1.0.0.

**Password hashing**
- bcrypt and Argon2 use their standard formats. PBKDF2 and scrypt use PHC-style strings. MD5 is bare unsalted lowercase hex and `verify` needs an explicit `algorithm: 'md5'`.
- bcrypt silently truncates long passwords (72 bytes) for API compatibility, documented in a code comment, JSDoc and the docs.

**Quality, security and process**
- Defaults follow OWASP and may only be raised or kept equal (see section 5). Known-answer vectors from RFCs and NIST are acceptance criteria. Node built-in test runner, no coverage threshold.
- ESLint and Prettier. Husky and commitlint enforce the commit format. CI lints only a pull request's commits. Pull requests are merged with merge commits.
- SECURITY.md uses GitHub private vulnerability reporting; only the latest minor of the current major receives security fixes. Dependabot updates dependencies. CI fails on high or critical audit findings in production dependencies.
- Docusaurus docs on GitHub Pages, latest version only, deployed on stable tags only.
- OpenSpec default core profile, tools `claude`, `cursor`, `codex`, `opencode`. Requirements use SHALL or MUST with WHEN/THEN scenarios.

## 2. Public API overview (indicative)

Signatures are finalized in each change's design; names below illustrate the shape.

| Subpath | Purpose | Indicative functions |
| --- | --- | --- |
| `encryption` | Authenticated encryption | `encrypt`, `encryptSync`, `decrypt`, `decryptSync` |
| `digest` | Hashes of data | `hash`, `hashSync` (`md5`, `sha-256`, `sha-512`) |
| `message-authentication` | HMAC | `hmac`, `hmacSync`, `verifyHmac`, `verifyHmacSync` |
| `password-hashing` | Stored password hashes | `hash`, `hashSync`, `verify`, `verifySync` |
| `key-derivation` | Raw derived keys | `derive`, `deriveSync` (`argon2id`, `scrypt`, `pbkdf2`) |
| `random` | Secure random values | `bytes`, `integer`, `uuid` (+ `Sync` where meaningful) |
| `comparison` | Constant-time equality | `equals` |

`argon2id`, `scrypt` and `pbkdf2` share one identifier and one implementation between `key-derivation` (raw bytes) and `password-hashing` (PHC string).

Encryption result shape:

```ts
type Encoding = 'hex' | 'base64' | 'base64url';

type KeyDerivation =
  | { algorithm: 'none' } // raw 32-byte key
  | { algorithm: 'argon2id'; salt: string; memory: number; passes: number; parallelism: number }
  | { algorithm: 'scrypt'; salt: string; cost: number; blockSize: number; parallelization: number }
  | { algorithm: 'pbkdf2'; salt: string; digest: 'sha-256' | 'sha-512'; iterations: number };

interface Aes256GcmEncryption {
  algorithm: 'aes-256-gcm';
  encoding: Encoding;
  keyDerivation: KeyDerivation;
  iv: string;
  tag: string;
  data: string;
}

type EncryptionResult = Aes256GcmEncryption; // the union grows with new ciphers
```

On decrypt, the algorithm identifier and key derivation parameters are rebuilt into canonical header bytes and authenticated as part of GCM's additional data together with the caller's AAD, so tampering with parameters fails authentication.

Password hash formats: `$2b$<cost>$...` (bcrypt), `$argon2id$v=19$m=...,t=...,p=...$<salt>$<hash>`, `$scrypt$ln=...,r=...,p=...$<salt>$<hash>`, `$pbkdf2-sha256$i=...$<salt>$<hash>`, and bare hex for MD5.

## 3. Repository layout

```
.
├── AGENTS.md  CLAUDE.md  DEVELOPMENT_PLAN.md  LICENSE
├── package.json  pnpm-workspace.yaml  pnpm-lock.yaml
├── tsconfig.json  tsconfig.build.esm.json  tsconfig.build.cjs.json
├── docs/                      Docusaurus workspace package (placeholder until its change)
├── openspec/                  config.yaml, specs/, changes/
├── src/
│   ├── packages/<namespace>/  one folder per subpath export, one file per algorithm
│   └── shared/                errors, encodings, deprecation, peer loading
├── tests/                     mirrors src/
└── .claude/ .cursor/ .agents/ .opencode/   generated by openspec init
```

## 4. Toolchain

- **Compilers.** `tsc` is TypeScript 7.0.2 (`typescript-7` alias). The bare `typescript` specifier is the `@typescript/typescript6` compatibility package (`tsc6`) for ESLint typed rules and TypeDoc, because TypeScript 7 has no JavaScript compiler API and typescript-eslint supports only TypeScript below 6.1.
- **Build.** Two `tsc` builds (ESM with `nodenext`, CJS with `commonjs` and `bundler` resolution), each output directory gets a `package.json` with its `type`. Verified with TypeScript 7.0.2 on a stub: type check, both builds, loading in both formats, and tests running on `.ts` sources.
- **Tests.** `node --test` on TypeScript sources through type stripping. Sources import with `.ts` extensions (`rewriteRelativeImportExtensions` rewrites them) and use erasable syntax only.
- **Commits.** commitlint with a custom header pattern and three custom rules; Husky `commit-msg` hook.

## 5. Security defaults (verify against the current OWASP cheat sheet inside each change)

| Algorithm | OWASP-based minimum to start from |
| --- | --- |
| Argon2id | 19 MiB memory, 2 passes, parallelism 1 |
| scrypt | cost 2^17, block size 8, parallelization 1 |
| bcrypt | work factor 10 or higher |
| PBKDF2-HMAC-SHA-256 | 600,000 iterations |
| PBKDF2-HMAC-SHA-512 | 210,000 iterations |

Defaults can be overridden by callers, are stored with hashes and ciphertexts, and can only be raised or kept equal in strength across releases. Raising or keeping equal is a minor release; lowering is a major release.

## 6. OpenSpec change backlog (dependency order, one capability per change)

Already scaffolded in `openspec/changes/` (validated with `openspec validate --all --strict`): items 1 to 4. Start with `/opsx:apply add-repository-tooling`.

| # | Change | Capability | Depends on | Brief |
| --- | --- | --- | --- | --- |
| 1 | `add-repository-tooling` | `repository-tooling` | none | Toolchain, builds, exports, lint, format, tests |
| 2 | `add-commit-conventions` | `commit-conventions` | 1 | commitlint rules, Husky hook |
| 3 | `add-shared-core` | `shared-core` | 1 | Errors, encodings, deprecation, lazy peer loading |
| 4 | `add-release-pipeline` | `release-pipeline` | 1, 2 | CI, tag release with provenance, docs deploy |
| 5 | `add-security-policy` | `security-policy` | 4 | SECURITY.md, Dependabot, audit gate |
| 6 | `add-random-generation` | `random` | 3 | Secure bytes, integers, UUIDs |
| 7 | `add-comparison` | `comparison` | 3 | Constant-time equality |
| 8 | `add-digest-contract` | `digest` | 3 | Namespace contract for digests |
| 9 | `add-sha-2` | `sha-2` | 8 | SHA-256 and SHA-512, NIST vectors |
| 10 | `add-message-authentication` | `hmac` | 7, 8 | HMAC with SHA-256/512, RFC 4231 vectors |
| 11 | `add-key-derivation-contract` | `key-derivation` | 3 | Namespace contract for raw key derivation |
| 12 | `add-pbkdf2` | `pbkdf2` | 11 | Key derivation, RFC 6070 and RFC 7914 vectors |
| 13 | `add-scrypt` | `scrypt` | 11 | Key derivation, RFC 7914 vectors |
| 14 | `add-argon2` | `argon2` | 11 | `argon2id`, `argon2i`, `argon2d`, RFC 9106 vectors |
| 15 | `add-password-hashing-contract` | `password-hashing` | 3, 7 | `hash`/`verify`, prefix dispatch, explicit algorithm for MD5 |
| 16 | `add-bcrypt` | `bcrypt` | 15 | `$2b$` only, 72-byte truncation, lazy peer |
| 17 | `add-md5` | `md5` | 8, 15 | Deprecated digest and password-hashing form |
| 18 | `add-encryption-contract` | `encryption` | 3, 11 | Typed result, AAD, header binding, decrypt output |
| 19 | `add-aes-256-gcm` | `aes-256-gcm` | 18, 12, 13, 14 | Cipher and KDF integration |
| 20 | `add-documentation-site` | `documentation-site` | 4, 19 | Docusaurus, TypeDoc through the TypeScript 6 package, GitHub Pages |

The PBKDF2, scrypt and Argon2 changes also add their PHC password-hash form once the `password-hashing` contract (15) exists; schedule their password-hashing requirements after item 15.

Create each remaining change with `/opsx:propose <change-name>`, review the generated artifacts, then apply and archive it.

## 7. Release flow

1. Maintainer bumps `version` in `package.json` and commits.
2. Maintainer pushes tag `vX.Y.Z` or `vX.Y.Z-<identifier>.N`.
3. `release.yml` checks tag and version match, repeats the verification, publishes with PNPM and provenance (`NPM_TOKEN`), then creates a GitHub release with generated notes.
4. For a stable tag, the workflow compares the version with the stable versions already published. A version higher than all of them is published under `latest`, then also gets `latest-<major>` and `latest-<major>.<minor>` (releasing 1.1.1 gives `latest`, `latest-1` and `latest-1.1`). Otherwise it is published under the broadest tag it still qualifies for: 1.9.9 after 2.0.0 gets `latest-1` and `latest-1.9`, and 1.0.5 after 1.1.1 gets only `latest-1.0`. A version lower than one already published in the same major.minor line fails before publishing. Pre-releases publish under a dist-tag named after the first pre-release identifier (for example `beta`), never receive `latest` or the version-line dist-tags, and are marked as pre-releases on GitHub.
5. `docs.yml` deploys the latest docs to GitHub Pages only for the stable release that takes `latest`, so pre-releases and patches for older lines never replace the published docs.

## 8. Risks and open technical points

- **TypeScript 7 ecosystem.** typescript-eslint and ESLint core lagged TypeScript 7 in the sources reviewed (July 2026). Keep the compatibility package until official support lands.
- **Synchronous bcrypt loading** in a dual-format package needs a per-format loader. A spike is the first task of `add-shared-core`.
- **`pnpm publish` with provenance and a token** is verified in the first task of `add-release-pipeline`.
- **Dependabot and the TypeScript alias pair** may not bump both entries consistently.
- **bcrypt truncation and MD5** are deliberate compatibility choices with security trade-offs; both stay documented prominently.

## 9. Assumptions made while writing this plan (veto any of them)

1. No root export; only the seven subpaths.
2. A string key is a password; a Buffer or Uint8Array key is a raw 32-byte key, recorded as `keyDerivation: { algorithm: 'none' }`.
3. The salt lives inside `keyDerivation`; result field names are `algorithm`, `encoding`, `keyDerivation`, `iv`, `tag`, `data`.
4. The header is bound into GCM additional data as described in section 2.
5. AGENTS.md adds two rules you did not list (do not edit generated tool files; do not bump versions or tag) and clarifies that public RFC or NIST test vectors do not violate "no secrets in fixtures".
6. The past-tense commit check examines only the first word.
7. CI tests on Node.js 24.7.0 and the latest 24.
8. A pre-release's dist-tag is its first pre-release identifier.
9. The `docs/` package is a placeholder; its Docusaurus content comes from change 20.
10. The generated `.claude/`, `.cursor/`, `.agents/` and `.opencode/` directories come from `openspec init --tools claude,cursor,codex,opencode` with 1.14.0.

## 10. Definition of done for 1.0.0

- All changes in section 6 archived, `openspec validate --all --strict` clean, every public function documented in JSDoc and the docs site.
- Known-answer vectors pass for every algorithm on both module formats.
- Defaults re-verified against OWASP, deprecation and truncation documentation present.
- `1.0.0` tag pushed by the maintainer; package, provenance, GitHub release and docs site verified.
