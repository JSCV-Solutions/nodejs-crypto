# Spec Delta

## ADDED Requirements

### Requirement: Namespace-owned type exports

A namespace entry point SHALL export only the type declarations that namespace owns, and a type declaration owned by the shared area SHALL NOT be re-exported by a namespace. A namespace that owns no type declaration SHALL export no type.

#### Scenario: Namespace owning a type

- **WHEN** a namespace declares a type in its own `typings/` folder
- **THEN** the namespace entry point SHALL export that type

#### Scenario: Namespace consuming a shared type

- **WHEN** a namespace uses a type declared in `src/shared/typings/`
- **THEN** the namespace entry point SHALL NOT re-export that type, and the shared type SHALL remain internal to the library

#### Scenario: Namespace owning no type

- **WHEN** a namespace declares no type of its own
- **THEN** its entry point SHALL export only its functions
