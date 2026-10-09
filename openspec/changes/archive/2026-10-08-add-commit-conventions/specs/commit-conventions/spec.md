# Spec Delta

## Purpose

Defines the commit message format used by the project and how it is enforced locally and in continuous integration.

## ADDED Requirements

### Requirement: Commit header format

Every commit first line SHALL match `<TYPE> - <Description>` where `<TYPE>` is one of CHORE, DOCS, ENHANCEMENT, FEATURE, FIX, GITIGNORE, HOTFIX, MERGE, REFACTOR, SECURITY, STYLE or TEST, written in uppercase and followed by a space, a hyphen and a space.

#### Scenario: Valid header

- **WHEN** a commit message starts with `FEATURE - Add SHA-256 digest`
- **THEN** validation SHALL pass

#### Scenario: Unknown type

- **WHEN** a commit message starts with `feat - Add SHA-256 digest` or `UPDATE - Add SHA-256 digest`
- **THEN** validation SHALL fail and list the allowed types

### Requirement: Description rules

The description SHALL start with a capital letter, SHALL be at most 50 characters (the type prefix is not counted) and SHALL NOT start with a verb in the past tense, checked heuristically on the first word.

#### Scenario: Description too long

- **WHEN** the description has 51 characters
- **THEN** validation SHALL fail

#### Scenario: Past-tense first word

- **WHEN** a commit message starts with `FIX - Fixed padding error`
- **THEN** validation SHALL fail and suggest the imperative form

#### Scenario: Lowercase description

- **WHEN** a commit message starts with `DOCS - update readme`
- **THEN** validation SHALL fail

### Requirement: Breaking change marker

A commit that contains a `BREAKING CHANGE:` marker in its body SHALL include a non-empty explanation of the breaking change after the marker.

#### Scenario: Marker without explanation

- **WHEN** the body contains `BREAKING CHANGE:` followed by nothing
- **THEN** validation SHALL fail

#### Scenario: Marker with explanation

- **WHEN** the body contains `BREAKING CHANGE: Default Argon2id memory cost was lowered`
- **THEN** validation SHALL pass

### Requirement: Free-form body and footer

Bodies and footers SHALL NOT be restricted beyond the breaking change rule, so phrases such as `Close #12` remain allowed.

#### Scenario: Issue-closing footer

- **WHEN** a valid commit ends with `Close #12`
- **THEN** validation SHALL pass

### Requirement: Local enforcement

A Husky `commit-msg` hook SHALL run the commit linter on every local commit.

#### Scenario: Invalid local commit

- **WHEN** a contributor commits with an invalid first line
- **THEN** the commit SHALL be rejected with the validation errors

### Requirement: Merge commit handling

Merge commits created by Git or GitHub SHALL NOT be rejected, and a hand-written `MERGE - <Description>` commit SHALL follow the same description rules as other types.

#### Scenario: Default GitHub merge message

- **WHEN** a pull request is merged with a merge commit titled `Merge pull request #6 from owner/branch`
- **THEN** no validation failure SHALL occur for that commit

### Requirement: Pull request commit linting in CI

CI SHALL validate only the commits introduced by a pull request, not the commits already on the target branch.

#### Scenario: Pull request with a bad commit

- **WHEN** one commit of a pull request violates the format
- **THEN** the CI check SHALL fail and name the offending commit
