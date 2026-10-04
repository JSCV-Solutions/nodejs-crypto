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
The repository SHALL provide scripts that fail on type errors, lint errors and formatting differences, and the lint configuration SHALL forbid `Math.random`, require explicit type annotations and require explicit return types.

#### Scenario: Math.random usage
- **WHEN** source code references `Math.random`
- **THEN** the lint script SHALL fail with a message pointing to the `random` namespace

#### Scenario: Unformatted file
- **WHEN** a file differs from the Prettier output
- **THEN** the format check script SHALL fail

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
