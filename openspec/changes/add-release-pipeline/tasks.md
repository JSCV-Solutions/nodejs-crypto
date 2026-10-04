# Tasks

## 1. Verification of assumptions

- [ ] 1.1 Verify `pnpm publish --provenance` works in GitHub Actions with `NPM_TOKEN` (dry run on a pre-release tag)
- [ ] 1.2 Verify `npm dist-tag add` works with the same token

## 2. Continuous integration

- [ ] 2.1 Add `ci.yml` with read-only permissions and the Node.js 24.7.0 and latest 24 matrix
- [ ] 2.2 Add the pull request commit lint job using base and head SHAs
- [ ] 2.3 Add the `openspec validate --all --strict` job using a pinned CLI version

## 3. Release

- [ ] 3.1 Add `release.yml` triggered by `v*.*.*` tags
- [ ] 3.2 Add the tag and `package.json` version consistency check
- [ ] 3.3 Add the dist-tag derivation and pre-release handling
- [ ] 3.4 Add publishing with provenance and the GitHub release with generated notes
- [ ] 3.5 Add publish-tag selection for `latest`, `latest-<major>` and `latest-<major>.<minor>` with the highest-stable-version checks and the pre-publish failure
- [ ] 3.6 Test the selection against version lists (1.1.1 after 1.1.0, 1.9.9 after 2.0.0, 1.0.5 after 1.1.1, 1.0.3 after 1.0.5, and a pre-release)

## 4. Documentation deployment

- [ ] 4.1 Add `docs.yml` triggered by stable tags, skipped for pre-releases and for stable releases that do not take `latest`
- [ ] 4.2 Enable GitHub Pages for the repository

## 5. Documentation

- [ ] 5.1 Document the release procedure (bump, commit, tag, push) and the dist-tags in the README contributing section
