# Proposal

## Why

The project uses its own commit format (`<TYPE> - <Description>`) and wants it enforced automatically so history, pull requests and release notes stay consistent.

## What Changes

- Define the allowed commit types and first-line rules as machine-checked requirements.
- Enforce them locally with a Husky `commit-msg` hook and in CI for the commits of a pull request.
- Require an explanation after every `BREAKING CHANGE:` marker in the commit body.
- Out of scope: any versioning or release automation driven by commits (releases are tag-driven), pre-commit lint hooks.

## Capabilities

### New Capabilities
- `commit-conventions`: format, validation and enforcement of commit messages.

### Modified Capabilities

## Impact

- New files: `commitlint.config.mjs`, `.husky/commit-msg`, a CI job (added by add-release-pipeline) that lints pull request commits.
- Dev dependencies: commitlint CLI and Husky (approved by the maintainer).
