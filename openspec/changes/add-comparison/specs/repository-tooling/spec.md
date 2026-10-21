# Spec Delta

## ADDED Requirements

### Requirement: Published declarations resolve for consumers

The build SHALL copy every hand-written `.d.ts` declaration folder under `src/`, both the shared area and each namespace's own `typings/` folder, into every output tree, and the smoke test SHALL type-check a generated consumer program against the published declarations of every subpath in both the ESM and the CJS tree.

#### Scenario: Namespace-owned declaration file

- **WHEN** a namespace declares a type in its own `typings/` folder
- **THEN** the built tree SHALL contain that declaration file and a consumer SHALL be able to import the type from the namespace subpath

#### Scenario: Missing declaration file

- **WHEN** the built tree lacks a declaration file that an emitted declaration references
- **THEN** the smoke test SHALL fail and report the unresolved module

#### Scenario: Both module formats

- **WHEN** the smoke test runs
- **THEN** it SHALL type-check the published declarations under both the `import` and the `require` conditions of the `exports` map
