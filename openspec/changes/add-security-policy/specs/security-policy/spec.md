# Spec Delta

## Purpose

Defines how security vulnerabilities are reported, which versions receive fixes, and how dependency hygiene is automated and enforced for this cryptography library.

## ADDED Requirements

### Requirement: Private vulnerability reporting channel

The repository SHALL provide a `SECURITY.md` that directs reporters to GitHub private vulnerability reporting for `JSCV-Solutions/nodejs-crypto` and SHALL NOT publish a public contact email or ask reporters to open public issues for vulnerabilities, per GitHub documentation on privately reporting a security vulnerability.

#### Scenario: Reporter reads the policy

- **WHEN** a reporter opens `SECURITY.md`
- **THEN** the file SHALL name GitHub private vulnerability reporting as the reporting channel with a link to the repository security advisories page

#### Scenario: No public disclosure requested

- **WHEN** `SECURITY.md` is inspected for reporting instructions
- **THEN** it SHALL NOT instruct reporters to file a public issue or send plaintext secrets, keys, or exploit details by email

### Requirement: Supported versions for security fixes

`SECURITY.md` SHALL state that only the latest minor of the current major line receives security fixes and that fixes are released as new versions with no backports to older lines.

#### Scenario: Supported line documented

- **WHEN** a user reads the supported-versions table in `SECURITY.md`
- **THEN** the latest minor of the current major SHALL be marked supported and older minors and majors SHALL be marked unsupported

#### Scenario: Fix released forward only

- **WHEN** a vulnerability is fixed
- **THEN** the fix SHALL ship in a new version of the supported line and no patch SHALL be backported to an unsupported line

### Requirement: Automated dependency updates

The repository SHALL provide `.github/dependabot.yml` that checks PNPM dependencies weekly, groups minor and patch updates to limit pull request noise, and uses a commit-message prefix compatible with the repository commit conventions.

#### Scenario: Weekly grouped updates

- **WHEN** Dependabot configuration is inspected
- **THEN** it SHALL declare a weekly schedule for the `pnpm` package ecosystem with grouped minor and patch updates

#### Scenario: Convention-compatible commits

- **WHEN** Dependabot opens an update pull request
- **THEN** the commit message prefix SHALL satisfy the repository commitlint header pattern so the CI commit lint job can pass

### Requirement: Production dependency audit gate

CI SHALL run `pnpm audit:prod` on pull requests and pushes to the default branch and SHALL fail when the audit reports a high or critical finding in production dependencies, consistent with OWASP Top 10 A06:2021 (Vulnerable and Outdated Components).

#### Scenario: High finding blocks merge

- **WHEN** a pull request introduces a production dependency with a high-severity advisory
- **THEN** the CI audit job SHALL fail and the failing advisory SHALL be identifiable in the job log

#### Scenario: Dev-only finding does not block

- **WHEN** an audit finding affects only development dependencies
- **THEN** the production audit gate SHALL pass

#### Scenario: Clean audit passes

- **WHEN** no high or critical production findings exist
- **THEN** the CI audit job SHALL pass

### Requirement: Security policy discoverability

The repository SHALL link `SECURITY.md` from `README.md` and SHALL document the `pnpm audit:prod` script and the Dependabot update flow in `CONTRIBUTING.md`.

#### Scenario: Policy linked from readme

- **WHEN** a newcomer reads `README.md`
- **THEN** a security section SHALL link to `SECURITY.md`

#### Scenario: Audit documented for contributors

- **WHEN** a contributor reads `CONTRIBUTING.md`
- **THEN** the guide SHALL describe when the audit gate runs and how to reproduce it locally with `pnpm audit:prod`
