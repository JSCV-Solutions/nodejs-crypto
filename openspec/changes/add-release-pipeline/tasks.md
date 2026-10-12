# Tasks

## 1. Verification of assumptions

- [x] 1.1 Verify `pnpm publish --provenance` works in GitHub Actions with `NPM_TOKEN` (dry run on a pre-release tag)
- [ ] 1.2 Verify `pnpm dist-tag add` works with the same token

Done for 1.1: the release workflow published the pre-release with
provenance using `NPM_TOKEN`. Still open for 1.2: a pre-release never
executes `dist-tag add` (its `extra-tags` are empty), so this closes on
the first stable release, which adds the `latest-*` tags.

## 2. Continuous integration

- [x] 2.1 Add `ci.yml` with read-only permissions and the Node.js 24.7.0 and latest 24 matrix
- [x] 2.2 Add the pull request commit lint job using base and head SHAs
- [x] 2.3 Add the `openspec validate --all --strict` job using a pinned CLI version

## 3. Release

- [x] 3.1 Add `release.yml` triggered by `v*.*.*` tags
- [x] 3.2 Add the tag and `package.json` version consistency check
- [x] 3.3 Add the dist-tag derivation and pre-release handling
- [x] 3.4 Add publishing with provenance and the GitHub release with generated notes
- [x] 3.5 Add publish-tag selection for `latest`, `latest-<major>` and `latest-<major>.<minor>` with the highest-stable-version checks and the pre-publish failure
- [x] 3.6 Test the selection against version lists (1.1.1 after 1.1.0, 1.9.9 after 2.0.0, 1.0.5 after 1.1.1, 1.0.3 after 1.0.5, and a pre-release)

Verified locally with `scripts/select-publish-tag.mjs --published-json`:
1.1.1 takes `latest` plus `latest-1`/`latest-1.1`; 1.9.9 publishes under
`latest-1` plus `latest-1.9`; 1.0.5 publishes under `latest-1.0` only;
1.0.3 after 1.0.5 fails; `1.0.0-beta.1` publishes under `beta`. An empty
list (first release) takes `latest`, and a numeric-only pre-release
identifier is rejected.

## 4. Documentation deployment

- [x] 4.1 Add `docs.yml` triggered by successful completion of the release workflow, skipped for pre-releases and for stable releases that do not take `latest`
- [x] 4.2 Enable GitHub Pages for the repository

Done: Pages is enabled with `workflow` builds and the custom domain is
set. The first real deployment still waits for the first stable release
taking `latest` (`docs/` is a placeholder until the documentation-site
change). Still to do outside this change: verify DNS for the custom
domain and enforce HTTPS.

## 5. Documentation

- [x] 5.1 Document the release procedure (bump, commit, tag, push) and the dist-tags in the README contributing section

Documented in `CONTRIBUTING.md` (`Releases`, per the contributor-guide
location) and linked from the README Contributing section.
