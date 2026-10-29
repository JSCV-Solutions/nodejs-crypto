# Spec Delta

## MODIFIED Requirements

### Requirement: Static quality gates

The repository SHALL provide scripts that fail on type errors, lint errors, formatting differences and Fallow static analysis findings, and the lint configuration SHALL forbid `Math.random`, require explicit type annotations and require explicit return types.

#### Scenario: Math.random usage

- **WHEN** source code references `Math.random`
- **THEN** the lint script SHALL fail with a message pointing to the `random` namespace

#### Scenario: Unformatted file

- **WHEN** a file differs from the Prettier output
- **THEN** the format check script SHALL fail

#### Scenario: Fallow script present

- **WHEN** the repository is inspected after this change is applied
- **THEN** a `pnpm fallow` script SHALL exist and SHALL run `fallow audit`

## ADDED Requirements

### Requirement: Fallow static analysis quality gate

The repository SHALL run Fallow as a changed-code quality gate on every pull request. The gate SHALL execute `fallow audit` against the files changed in the pull request, using the committed `fallow.toml` configuration, and SHALL fail the pull request when an error-severity finding is present in changed code. The gate SHALL analyze the library root only and SHALL ignore `dist/`, `openspec/`, the `docs/` workspace package and generated files. The gate SHALL run with Fallow's `audit.gate` set to `all` after the one-time cleanup of pre-existing findings, and SHALL use best-effort type-aware analysis targeting `tsconfig.json`. CRAP scoring SHALL use Fallow's static coverage estimate. The gate SHALL post a summary comment on the pull request listing the findings. Telemetry SHALL be disabled and no network egress SHALL be required for the analysis.

#### Scenario: Clean pull request

- **WHEN** a pull request introduces no error-severity Fallow findings in changed code
- **THEN** the Fallow gate SHALL exit successfully and the pull request SHALL not be blocked by it

#### Scenario: New finding in changed code

- **WHEN** a pull request introduces an error-severity Fallow finding in a changed file
- **THEN** the Fallow gate SHALL fail and the pull request SHALL be blocked

#### Scenario: Pre-existing finding untouched

- **WHEN** a pull request does not touch a file carrying a pre-existing finding
- **THEN** that finding SHALL NOT cause the gate to fail

#### Scenario: Out-of-scope trees ignored

- **WHEN** the gate runs
- **THEN** files under `dist/`, `openspec/`, `docs/` and generated files SHALL NOT be analyzed

#### Scenario: Offline execution

- **WHEN** the gate runs in CI
- **THEN** it SHALL complete without network access and with Fallow telemetry disabled

### Requirement: Fallow dependency approval

The repository SHALL record the maintainer's approval of Fallow as a development dependency before it is added. The approval SHALL be captured in this change, and implementation SHALL add `fallow` to `devDependencies` and the corresponding `minimumReleaseAgeExclude` entries in `pnpm-workspace.yaml`.

#### Scenario: Approval recorded

- **WHEN** this change is applied
- **THEN** the maintainer's approval of Fallow as a development dependency SHALL be documented in the change artifacts

#### Scenario: No production dependency added

- **WHEN** Fallow is added
- **THEN** it SHALL be added to `devDependencies` only and SHALL NOT appear in `dependencies` or `peerDependencies`
