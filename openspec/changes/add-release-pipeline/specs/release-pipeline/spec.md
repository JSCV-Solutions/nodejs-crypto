# Spec Delta

## Purpose

Defines how the library is verified in pull requests and how a pushed version tag turns into a published npm package, a GitHub release and deployed documentation.

## ADDED Requirements

### Requirement: Pull request verification

CI SHALL run on every pull request and SHALL fail when formatting, lint, type check, tests, build, the built-package smoke test, the pull request commit lint or `openspec validate --all --strict` fails.

#### Scenario: Failing check

- **WHEN** any verification step fails on a pull request
- **THEN** the CI result SHALL be failed and the failing step SHALL be identifiable

#### Scenario: Supported Node.js versions

- **WHEN** CI runs the test step
- **THEN** it SHALL run on Node.js 24.7.0 and on the latest Node.js 24

### Requirement: Tag-only releases

Publishing SHALL be triggered only by pushing a tag that matches `v*.*.*`, and no push to a branch and no commit message SHALL trigger a publish.

#### Scenario: Branch push

- **WHEN** commits are pushed to any branch
- **THEN** no package SHALL be published

### Requirement: Tag and version consistency

The release workflow SHALL fail before publishing when the tag, without its leading `v`, differs from the `version` in `package.json`.

#### Scenario: Mismatch

- **WHEN** tag `v1.2.0` is pushed while `package.json` says `1.1.0`
- **THEN** the workflow SHALL fail and nothing SHALL be published

### Requirement: Verified publish with provenance

The release workflow SHALL repeat the full verification, then publish with PNPM to the public npm registry with provenance and public access using the `NPM_TOKEN` secret.

#### Scenario: Successful release

- **WHEN** a valid stable tag is pushed and verification passes
- **THEN** the package SHALL be published with a provenance attestation

### Requirement: Version-line dist-tags

After a stable release is published, the release workflow SHALL add the npm dist-tags `latest-<major>` and `latest-<major>.<minor>` to the published version, each only when that version is the highest stable version in that major line or in that major.minor line respectively, SHALL NOT add them for pre-releases, and SHALL NOT use dist-tag names that npm rejects as valid semver ranges.

#### Scenario: Highest stable release

- **WHEN** stable tag `v1.1.1` is pushed and no higher stable 1.x.x version exists
- **THEN** the package SHALL be published under dist-tag `latest` and the dist-tags `latest-1` and `latest-1.1` SHALL point to version 1.1.1

#### Scenario: Patch for an older minor line

- **WHEN** stable tag `v1.0.5` is pushed after version 1.1.1 exists
- **THEN** dist-tag `latest-1.0` SHALL point to version 1.0.5 and `latest-1` SHALL remain on version 1.1.1

#### Scenario: Pre-release

- **WHEN** tag `v1.2.0-beta.1` is pushed
- **THEN** no `latest-*` dist-tag SHALL be added or moved and `latest` SHALL be unchanged

### Requirement: Latest dist-tag only for the highest stable version

The release workflow SHALL assign the `latest` dist-tag to a stable release only when its version is higher than every stable version already published. Because a publish needs a dist-tag, it SHALL publish any other stable release under the broadest version-line dist-tag it qualifies for, and it SHALL fail before publishing when the version is lower than a stable version already published in the same major.minor line.

#### Scenario: Highest stable version

- **WHEN** stable tag `v1.1.1` is pushed and version 1.1.0 is the highest stable version published
- **THEN** version 1.1.1 SHALL be published under `latest` and SHALL also receive `latest-1` and `latest-1.1`

#### Scenario: Patch for an older major

- **WHEN** stable tag `v1.9.9` is pushed after version 2.0.0 was published
- **THEN** the package SHALL be published under `latest-1`, SHALL also receive `latest-1.9`, and `latest` SHALL remain on version 2.0.0

#### Scenario: Lower than an existing version in the same minor line

- **WHEN** stable tag `v1.0.3` is pushed after version 1.0.5 was published
- **THEN** the workflow SHALL fail before publishing

### Requirement: Pre-release dist-tags

A tag whose version contains a SemVer pre-release part SHALL be published under a dist-tag named after the first pre-release identifier (for example `beta`), SHALL NOT receive the `latest` dist-tag, and its GitHub release SHALL be marked as a pre-release.

#### Scenario: Beta tag

- **WHEN** tag `v1.0.0-beta.1` is pushed
- **THEN** the package SHALL be published under dist-tag `beta` and `latest` SHALL be unchanged

### Requirement: Generated release notes

Each release SHALL create a GitHub release whose notes are produced by GitHub's built-in generator.

#### Scenario: Release created

- **WHEN** publishing succeeds
- **THEN** a GitHub release for the tag SHALL exist with generated notes

### Requirement: Latest-only documentation deployment

Documentation SHALL be built and deployed to GitHub Pages only for the stable release that takes the `latest` dist-tag, SHALL show only that version, and SHALL NOT be deployed for pre-release tags or for stable releases that do not take `latest`.

#### Scenario: Stable release taking latest

- **WHEN** tag `v1.0.0` is pushed and the release takes `latest`
- **THEN** the documentation site SHALL be built and deployed

#### Scenario: Stable patch for an older line

- **WHEN** tag `v1.9.9` is pushed after version 2.0.0 was published
- **THEN** the documentation deployment SHALL be skipped

#### Scenario: Pre-release tag

- **WHEN** tag `v1.0.0-beta.1` is pushed
- **THEN** the documentation deployment SHALL be skipped

### Requirement: Least-privilege workflow permissions

Workflows SHALL declare the minimum permissions they need, and only the release workflow SHALL request permission to write contents and to create identity tokens for provenance.

#### Scenario: Pull request workflow

- **WHEN** the pull request workflow runs
- **THEN** it SHALL have read-only repository permissions
