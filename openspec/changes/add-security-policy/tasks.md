# Tasks

## 1. Security policy document

- [ ] 1.1 Add `SECURITY.md` with private vulnerability reporting channel, supported-versions table (latest minor of current major only, no backports), and no public-issue or email instructions, and verify the advisories link resolves and the file contains no secrets or contacts
- [ ] 1.2 Link `SECURITY.md` from a `README.md` security section and document the reporting channel in `CONTRIBUTING.md`, and verify both links render and `pnpm format:check` passes for the edited files

## 2. Automated dependency updates

- [ ] 2.1 Add `.github/dependabot.yml` for the `pnpm` ecosystem with a weekly schedule, grouped minor/patch updates, ungrouped majors, and a `CHORE -` style commit prefix, and verify the YAML parses and the prefix satisfies the commitlint header pattern
- [ ] 2.2 Document the Dependabot schedule and review flow in `CONTRIBUTING.md`, and verify `pnpm format:check` passes for the edited files

## 3. Production audit gate

- [ ] 3.1 Add a dedicated `audit` job to `.github/workflows/ci.yml` running `pnpm install --frozen-lockfile` then `pnpm audit:prod` on pull requests and pushes to `main` with read-only permissions, and verify the workflow YAML parses and the job is identifiable in CI
- [ ] 3.2 Document the audit gate and local reproduction (`pnpm audit:prod`, fail on high or critical prod findings, dev-only findings ignored) in `CONTRIBUTING.md`, and verify the documented command runs clean locally

## 4. Validation

- [ ] 4.1 Confirm the maintainer enables GitHub private vulnerability reporting for `JSCV-Solutions/nodejs-crypto` outside the repository, and verify the `SECURITY.md` advisories link opens the reporting page
- [ ] 4.2 Run `pnpm format:check`, `pnpm lint`, and `npx @fission-ai/openspec@1.14.0 validate --all --strict`, and verify all three pass

Note: no algorithms ship in this change, so no known-answer vector tasks apply; no public functions ship, so no JSDoc or docs-site function tasks apply.
