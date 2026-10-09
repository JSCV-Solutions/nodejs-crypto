# Design

## Context

The format is not Conventional Commits, so the stock commitlint presets do not apply. Commitlint accepts a custom header pattern and custom rules from plugins.

## Goals / Non-Goals

**Goals:**

- Machine-check every rule the maintainer defined.

**Non-Goals:**

- Deriving versions or release notes from commit types.

## Decisions

- **Header pattern.** A parser preset with `^(\S+) - (.+)$` mapped to type and subject, plus the standard `type-enum`, `type-case`, `type-empty` (`never`), `subject-empty` (`never`) and `subject-max-length` (50) rules. The pattern is deliberately looser than `^([A-Z]+) - (.+)$`: commitlint passes built-in rules vacuously when a capture group is null, so a strict pattern would let a header such as `feat - Add ...` through, while the loose pattern still parses the mistyped type and reports it through `type-enum` (which lists the allowed types) and `type-case`. Headers with no separator at all still parse to null and are caught by `type-empty`/`subject-empty`.
- **Custom rules.** A local plugin supplies `subject-capitalized`, `subject-no-past-tense` and `breaking-change-explained`. Rejected: the built-in `sentence-case` rule, whose semantics differ from "starts with a capital letter".
- **Past-tense heuristic.** Only the first word is examined: it fails when it ends in `ed` or is a known irregular past form, minus an allowlist of imperative verbs ending in `ed` (embed, feed, need, seed, speed, proceed, succeed, exceed). Checking later words would flag adjectives such as `shared`.
- **Merge commits.** Rely on commitlint's default ignores for `Merge ...` messages. `MERGE - ...` messages are validated normally.
- **CI scope.** The CI job passes the pull request base and head SHAs to the linter, so existing history is never re-linted.

## Risks / Trade-offs

- The past-tense check can produce false positives or negatives. It is documented as a heuristic and the allowlist can grow.
