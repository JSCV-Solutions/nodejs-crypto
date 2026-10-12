# Spec Delta

## Purpose

Defines where source files live across the whole `src/` tree so that
interfaces and type aliases each have one predictable home that
humans and coding agents can find and extend as namespaces land.

## ADDED Requirements

### Requirement: Type declaration placement

Interfaces and type aliases belonging to a runtime module at
`<area>/<name>.ts` SHALL live in `<area>/typings/<name>.d.ts`, and the
runtime module SHALL consume them through `import type`.

#### Scenario: New interface for a module

- **WHEN** a contributor adds an interface used by `src/shared/inputs.ts`
- **THEN** the interface SHALL be declared in
  `src/shared/typings/inputs.d.ts`

#### Scenario: Type-only imports

- **WHEN** a runtime module uses a relocated declaration
- **THEN** it SHALL import it with `import type` so no runtime import
  remains

### Requirement: Classes stay in runtime modules

Classes (today only the `NodeCryptoError` hierarchy, the single
exception to the functional-exports rule) SHALL stay in the runtime
`.ts` module and SHALL NOT move into `.d.ts` files, which cannot hold
runtime code.

#### Scenario: Error class location

- **WHEN** the error hierarchy is inspected
- **THEN** every error class SHALL be declared in `src/shared/errors.ts`
  while only its supporting types live under `src/shared/typings/`

### Requirement: Unchanged public surface

The reorganization SHALL NOT change subpath exports, runtime behavior
or the types consumers resolve from the built output.

#### Scenario: Relocated declarations

- **WHEN** the library is type-checked, built and tested after the move
- **THEN** every consumer-visible type SHALL resolve exactly as before
  with no export added, removed or renamed

### Requirement: Tests mirror runtime modules only

Tests SHALL mirror runtime `.ts` modules under `tests/` and SHALL NOT
add test files for pure `.d.ts` declarations, which have no runtime
behavior to execute.

#### Scenario: Test layout after the move

- **WHEN** the shared declarations move into `src/shared/typings/`
- **THEN** no new files SHALL appear under `tests/shared/` for them
