# Proposal

## Why

A public cryptography library needs a documented vulnerability reporting path and enforced dependency hygiene before 1.0.0. There is currently no `SECURITY.md`, no Dependabot configuration, and the existing `pnpm audit:prod` script is not enforced in CI, so vulnerable production dependencies could ship unnoticed.

## What Changes

- Add `SECURITY.md` at the repository root directing reporters to GitHub private vulnerability reporting, stating the supported-versions policy (only the latest minor of the current major receives security fixes), and stating that fixes are released as new versions with no backports.
- Add `.github/dependabot.yml` with weekly PNPM updates, grouped minor/patch updates, and default commit-message prefix compatible with the repository commit conventions.
- Add a CI audit job that runs `pnpm audit:prod` (fail on high or critical findings in production dependencies) on pull requests and pushes to the default branch.
- Document the audit script and the security-reporting link in `CONTRIBUTING.md` and link `SECURITY.md` from `README.md`.
- Out of scope: enabling GitHub private vulnerability reporting in repository settings (maintainer action outside the repository), secret scanning, CodeQL, SAST, license scanning, automatic merging of Dependabot pull requests, changes to release signing or provenance (release-pipeline change), and any cryptographic primitive or default-parameter change.

## Capabilities

### New Capabilities

- `security-policy`: vulnerability reporting policy, automated dependency updates, and production dependency audit enforcement.

### Modified Capabilities

## Impact

- New files: `SECURITY.md`, `.github/dependabot.yml`.
- Modified files: `.github/workflows/ci.yml` (new audit job), `package.json` only if a script wiring change is needed (no new dependencies), `README.md` and `CONTRIBUTING.md` (documentation links).
- Requires the maintainer to confirm GitHub private vulnerability reporting is enabled for `JSCV-Solutions/nodejs-crypto`; no code or public API changes.
