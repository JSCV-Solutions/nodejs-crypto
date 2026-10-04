# Design

## Context

Version bumps are manual. The maintainer edits `package.json`, commits and pushes a tag. `pnpm publish` on a tag checkout runs in a detached state, so its Git checks must be disabled explicitly in CI.

## Goals / Non-Goals

**Goals:**
- A tag is the single release trigger; the workflow verifies instead of trusting it.

**Non-Goals:**
- Computing versions, writing changelog files, publishing to registries other than npm.

## Decisions

- **Three workflows.** `ci.yml` (pull requests and pushes to the default branch), `release.yml` (tags) and `docs.yml` (tags). Separate files keep permissions minimal. Rejected: one workflow with conditional jobs, which widens permissions.
- **Dist-tag derivation.** Take the SemVer pre-release segment after the first hyphen and use its first dot-separated identifier. A pre-release with a numeric-only first identifier is rejected because dist-tags cannot be valid version numbers.
- **Version-line dist-tags.** npm refuses dist-tag names that are valid semver ranges, and `1`, `1.1`, `v1` and `1.x` all are (`npm publish --tag` and `npm dist-tag add` both check this), so those names cannot be used. A `latest-` prefix is accepted. After publishing, the release job lists the published stable versions (`npm view <package> versions --json`), computes the highest stable version in the released major and major.minor lines, and runs `npm dist-tag add <package>@<version> latest-<major>` and `latest-<major>.<minor>` only where the released version is that highest one. Rejected: floating Git tags, which npm users cannot install from. npm consumers can also use semver ranges (`@jscv-solutions/node-crypto@1`, `@~1.1`).
- **Publish tag selection.** npm needs a dist-tag at publish time and defaults to `latest`, so the job always passes `--tag` explicitly. Before publishing it lists published stable versions (`npm view <package> versions --json`) and decides which of `latest`, `latest-<major>` and `latest-<major>.<minor>` the new version qualifies for (highest in that scope). It publishes under the broadest qualifying tag, then adds the narrower qualifying tags with `npm dist-tag add`. If none qualifies, the version is lower than one already published in its major.minor line, and the job fails before publishing. Rejected: publishing under `latest` and repairing it afterwards, which briefly serves an older version as `latest`.
- **Release notes.** GitHub's generator (`gh release create --generate-notes`). Rejected: git-cliff, to keep the pipeline dependency-free per the maintainer's choice.
- **Docs follow `latest`.** `docs.yml` skips tags containing a hyphen and runs the same highest-stable-version check against the existing `v*.*.*` stable tags, deploying only when the pushed tag is the highest. A stable patch for an older line therefore cannot replace the current docs.
- **Commit lint scope.** Uses the pull request base and head SHAs with full history fetched.
- **Provenance.** Requires `id-token: write` on the release job and `publishConfig.provenance` in the package manifest. Whether `pnpm publish` forwards provenance correctly with a token is verified in the first task.

## Risks / Trade-offs

- `NPM_TOKEN` is a long-lived secret. Prefer a granular token limited to this package.
- Adding dist-tags is a separate registry call after publishing. If it fails, the version stays published without them, the job fails visibly, and the tags can be added by hand with `npm dist-tag add`.
- Both the dist-tag decision and the docs check depend on the published version list and the existing tags. A registry or API failure fails the job before any publish, which is safe but needs a manual re-run.
- A tag pushed from the wrong commit publishes that commit. The version check reduces, but does not remove, this risk.
