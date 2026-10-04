# Proposal

## Why

Releases are manual and tag-driven, and both the npm package and the documentation site must be published reproducibly, with provenance, from a tag the maintainer pushes.

## What Changes

- Add continuous integration for pull requests: formatting, lint, type check, tests, build, smoke test, commit lint for the pull request's commits and `openspec validate`.
- Add a release workflow triggered only by tags matching `v*.*.*` that verifies, publishes to npm with provenance and creates a GitHub release with generated notes.
- Support pre-releases (tags with a SemVer pre-release part) published under a non-`latest` dist-tag.
- Add the npm dist-tags `latest-<major>` and `latest-<major>.<minor>` on stable releases (version 1.1.1 yields `latest`, `latest-1` and `latest-1.1`).
- Add a documentation deployment workflow triggered by stable tags that deploys to GitHub Pages only for the release that takes `latest`.
- Assign `latest` only to the highest stable version published.
- Out of scope: automatic version bumping, semantic-release, changelog files, Dependabot configuration and audit policy (security-policy change), Docusaurus content (documentation-site change).

## Capabilities

### New Capabilities

- `release-pipeline`: continuous integration, tag-driven npm publishing and documentation deployment.

### Modified Capabilities

## Impact

- New files under `.github/workflows/`.
- Requires the `NPM_TOKEN` repository secret and GitHub Pages enabled for the repository `JSCV-Solutions/nodejs-crypto`.
