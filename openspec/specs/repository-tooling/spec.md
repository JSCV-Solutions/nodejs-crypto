# repository-tooling Specification

## Purpose

Defines how the library is built, packaged, checked and tested so that every contributor and every CI run produces identical results from exact tool versions.

## Requirements

### Requirement: Exact toolchain versions

The repository SHALL pin Node.js to a minimum of 24.7.0 through `engines.node`, PNPM to 12.8.1 through both `packageManager` and `engines.pnpm`, and TypeScript to 7.0.2 as an exact dependency version without range operators.

#### Scenario: Unsupported Node.js version

- **WHEN** a contributor installs dependencies with a Node.js version below 24.7.0
- **THEN** installation SHALL fail with an engine mismatch error

#### Scenario: Exact TypeScript version

- **WHEN** the dependency manifest is inspected
- **THEN** the TypeScript 7 entry SHALL be exactly `7.0.2` with no `^` or `~`

### Requirement: Dual-compiler setup

The `tsc` command SHALL resolve to TypeScript 7.0.2, and the bare `typescript` package specifier SHALL resolve to a TypeScript 6 compatibility package so that tools requiring the JavaScript compiler API keep working.

#### Scenario: Compiling the library

- **WHEN** a build or type-check script runs `tsc`
- **THEN** the TypeScript 7.0.2 compiler SHALL perform the work

#### Scenario: Typed lint rules

- **WHEN** ESLint runs rules that need type information
- **THEN** it SHALL load the TypeScript 6 compatibility package through the bare `typescript` specifier

### Requirement: ESM and CJS output

The build SHALL emit an ESM tree and a CJS tree, each with declaration files, and each tree SHALL be loadable by Node.js according to its own module format.

#### Scenario: Importing from ESM

- **WHEN** an ESM consumer imports a namespace subpath
- **THEN** it SHALL receive the ESM build with its types

#### Scenario: Requiring from CommonJS

- **WHEN** a CommonJS consumer requires a namespace subpath
- **THEN** it SHALL receive the CJS build with its types

### Requirement: Subpath exports without a root entry

The published package SHALL expose one subpath export per namespace (`encryption`, `digest`, `message-authentication`, `password-hashing`, `key-derivation`, `random`, `comparison`) and SHALL NOT expose a root entry point.

#### Scenario: Importing an undeclared path

- **WHEN** a consumer imports a path that is not declared in `exports`
- **THEN** Node.js SHALL reject the import

#### Scenario: Unused optional peer dependency

- **WHEN** a consumer imports only the `digest` subpath and does not install bcrypt
- **THEN** the import SHALL succeed and no bcrypt module SHALL be loaded

### Requirement: Published package contents

The published package SHALL contain only the compiled output, the license and the readme.

#### Scenario: Packing the library

- **WHEN** the package is packed for publishing
- **THEN** the archive SHALL NOT contain sources, tests, specifications or tool configuration

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

### Requirement: Fast test execution

Tests SHALL run with the Node.js built-in test runner directly against TypeScript sources without a prior build, and the repository SHALL NOT enforce a coverage threshold.

#### Scenario: Running tests

- **WHEN** the test script runs on a clean checkout after installation
- **THEN** it SHALL execute every `*.test.ts` file under `tests/` without compiling to disk

### Requirement: Workspace layout

The repository SHALL be a PNPM workspace whose root is the library package and whose only other member is the `docs/` package.

#### Scenario: Installing the workspace

- **WHEN** dependencies are installed from the repository root
- **THEN** both the library and the docs package SHALL be linked in one lockfile
