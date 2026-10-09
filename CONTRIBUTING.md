# Contributing

This guide covers the day-to-day contributor workflow: setup, scripts,
the commit message format and the pull request process. AI coding agents
follow `AGENTS.md`; the commit format below is binding for everyone.

## Prerequisites

- Node.js 24.7.0 or newer (see `engines.node` in `package.json`).
- PNPM 12.8.1 (see `packageManager` and `engines.pnpm`).
- Install dependencies from the repository root:

```bash
pnpm install
```

`pnpm install` also activates the Husky Git hooks through the `prepare`
script, so commits are linted locally with no extra setup.

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

Run `pnpm typecheck` and `pnpm test` after every source change.
Keep `pnpm lint` and `pnpm format:check` green before pushing.

## Commit message format

Every commit first line uses `<TYPE> - <Description>`:

```text
FEATURE - Add SHA-256 digest
FIX - Reject empty salt
MERGE - Pull request #6
```

Allowed types (uppercase) and what each one is for:

**CHORE:** chore-related changes.

E.g: `CHORE - Update dependencies`

**DOCS:** project documentation added or updated. This may include, but
is not limited to, updates to the README.md file.

E.g: `DOCS - Update README setup instructions`

**ENHANCEMENT:** improvements applied to existent functionality.

E.g: `ENHANCEMENT - Add user verification through email`

**FEATURE:** new specific functionality added.

E.g: `FEATURE - Add view to register`

**FIX:** a bug introduced in any functionality or enhancement, fixed.

E.g: `FIX - Animations of Chloe for the character design step`

**GITIGNORE:** changes applied to the .gitignore file.

E.g: `GITIGNORE - Add .env file`

**HOTFIX:** a critical bug present in production, in any functionality
or enhancement, fixed.

E.g: `HOTFIX - Fix bug that prevented users from logging in`

**MERGE:** a merge of external or internal branches applied.

E.g: `MERGE - Pull request #6`

**REFACTOR:** changes applied to the project's codebase in order to
improve its readability, maintainability, etc.

E.g: `REFACTOR - Improve code readability`

**SECURITY:** security-related changes. This may include patches to
security issues or updates of vulnerable dependencies.

E.g: `SECURITY - Patch authentication bypass`

**STYLE:** changes applied to the project's codebase in order to
improve its style.

E.g: `STYLE - Add missing semicolons`

**TEST:** tests added, updated or removed.

E.g: `TEST - Add unit tests for the user model`

The description is a capitalized, short (50 characters or fewer)
summary of the committed changes. It cannot include verbs in the past
tense. These rules are checked by `commitlint.config.mjs` and the local
`commitlint.rules.mjs` plugin:

- Starts with a capital letter.
- At most 50 characters (the `<TYPE> - ` prefix is not counted).
- Does not start with a verb in the past tense; use the imperative form
  (`Add`, not `Added`). Only the first word is checked, heuristically:
  it fails when it ends in `ed` or is a known irregular past form, except
  for an allowlist of imperatives ending in `ed` (`embed`, `feed`, `need`,
  `seed`, `speed`, `proceed`, `succeed`, `exceed`).

Body and footer rules:

- A `BREAKING CHANGE:` marker must be followed by a non-empty
  explanation of the breaking change.
- Anything else in the body or footer is free-form, so footers such as
  `Close #12` are allowed.

Merge commits created by Git or GitHub (for example
`Merge pull request #6 from owner/branch`) are ignored by the linter.
A hand-written `MERGE - <Description>` commit follows the same
description rules as every other type.

No commit type triggers a release. Releases are manual: the maintainer
bumps the version and pushes a `v*.*.*` tag. Never bump versions, create
tags or publish from a working branch.

## Enforcement

- Local: the `.husky/commit-msg` hook runs commitlint on every commit
  and rejects invalid messages with the validation errors.
- Pull requests: only the commits introduced by the pull request are
  linted, never the history already on the target branch. The CI job for
  this arrives with the release pipeline change; until then reviewers
  check the format by hand.
- To lint a message file manually:

```bash
pnpm exec commitlint --edit <message-file>
```

## Pull requests

- Keep to one capability per change and follow the OpenSpec workflow:
  propose, review, apply, archive. Do not start implementing in the same
  step as proposing.
- Pull requests are merged with merge commits.
- Never add a dependency without explicit approval from the maintainer.
- Never include secrets, passwords, keys or plaintext in code, errors,
  comments, tests or fixtures. Public known-answer vectors from RFCs or
  NIST are allowed because they are published test data.
