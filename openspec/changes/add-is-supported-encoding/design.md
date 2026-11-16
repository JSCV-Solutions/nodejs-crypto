# Design

## Context

The shared encodings module (`src/shared/encodings.ts`) already owns `encodeBytes`, `decodeText` and `isWellFormed` for the `Encoding` union defined in `src/shared/typings/encodings.d.ts`. The only consumer of a membership test today is `random` (`src/packages/random/bytes.ts`), which keeps a private `ReadonlySet<Encoding>`. `digest` and `encryption` do not exist yet (backlog items 8 and 18), so their contracts can adopt the shared helper from the start. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- A single, reusable membership test for the `Encoding` union that all namespaces can import.
- No change to `random`'s externally observable behavior (accepted inputs, error code, message).
- A clear refinement path so `digest` and `encryption` do not re-declare the closed set.

**Non-Goals:**

- No new error class or error code: the guard does not throw. `INVALID_ARGUMENT` remains the code callers raise when rejecting an encoding argument, per `shared-core`.
- No change to the `Encoding` union itself.
- No implementation of `digest` or `encryption` (out of scope; those are separate changes).

## Decisions

- **Capability ownership: modify `shared-core`.** The guard is shared infrastructure for the `Encoding` union that `shared-core` already owns, and it lives in `src/shared/encodings.ts`. Rejected: a new capability (for example `shared-encodings`), which would split one cohesive shared concern across two specs and violate AGENTS.md rule 9 (one capability per change) without adding a boundary that can own related requirements independently.

- **Home: `src/shared/encodings.ts`.** This module already owns encode/decode and strict validation for the `Encoding` union, so membership belongs beside them. Rejected: `src/shared/algorithms.ts` (that module is scoped to algorithm identifiers and raises `UNSUPPORTED_ALGORITHM`; mixing encodings there would blur the ownership boundary and the error-code semantics) and `src/packages/random/bytes.ts` (the current private home, which is exactly the duplication this change removes).

- **Shape: a throwing assertion `assertSupportedEncoding(value: unknown): asserts value is Encoding`.** It raises `InvalidArgumentError` (`INVALID_ARGUMENT`) for any value outside the closed set and returns `void`, narrowing `value` to `Encoding` after the call. This removes the manual throw at each call site, matches the behavior of `random`'s private `assertEncoding`, and keeps the membership knowledge in one place. Rejected: a boolean type guard `isSupportedEncoding(value): value is Encoding`. Reasons: (1) a guard leaves every caller to re-implement the throw, re-introducing the per-namespace duplication this change exists to remove; (2) the throw's message and code would have to be re-specified at each call site, risking drift; (3) the issue's own throwing variant is named `assertSupportedEncoding`, so adopting it keeps the name aligned with the precedent. The assertion-function form (`asserts value is Encoding`) preserves type narrowing, so callers still get a narrowed `Encoding` after the call without a separate guard.

- **Name: `assertSupportedEncoding`, not `isSupportedEncoding`.** The throwing shape is named `assertSupportedEncoding` in the issue, and the `is*` prefix denotes a boolean predicate, which this function no longer is. Rejected: keeping the working name `isSupportedEncoding` for a throwing function, which would mislead callers about its contract.

- **Input type: `unknown`.** An assertion function's input must be `unknown` so it can reject non-string values (numbers, objects, `null`, `undefined`) at runtime boundaries where the value arrives untyped. Rejected: `string`, which would let non-string inputs bypass the check at the type level and would not cover the cases the spec requires to throw.

- **Random delegation: replace the private guard and helper.** `random`'s `supportedEncodings` set and its `assertEncoding` helper are removed; `bytes`/`bytesSync` call `assertSupportedEncoding(encoding)` directly. Because `random.bytes(length)` permits `undefined` to mean "no encoding requested", `random` guards `undefined` before the call (`if (encoding !== undefined) assertSupportedEncoding(encoding)`). Behavior is unchanged: the same inputs are accepted, the same `INVALID_ARGUMENT` code is raised, and the same message is used. Rejected: keeping the private set or helper alongside the shared assertion, which would leave two sources of truth and defeat the purpose of the change.

- **Refinement path for `digest` and `encryption`.** Neither namespace exists yet. When their contracts are written (backlog items 8 and 18), they SHALL import `assertSupportedEncoding` from `src/shared/encodings.ts` and call it to validate any encoding argument; they SHALL NOT re-declare a `ReadonlySet<Encoding>` or a local closed list. If an encoding argument is rejected, the error code SHALL be `INVALID_ARGUMENT`, consistent with `shared-core` and `random`.

## Risks / Trade-offs

- [Drift risk if a namespace ignores the helper] → Mitigation: the `shared-core` requirement above is normative, and the refinement path is stated in this design and in the proposal's Impact; review of `digest`/`encryption` changes should check for a local set.
- [Message stability] → Mitigation: `random` keeps its existing message string verbatim; only the membership predicate changes, so no observable difference.
- [Assertion-function narrowing] → Mitigation: `assertSupportedEncoding` is declared as `asserts value is Encoding`, so callers get a narrowed `Encoding` after the call without a separate guard, while `undefined` sentinels (such as `random.bytes(length)` meaning "no encoding") are still handled by the caller before the call (`if (encoding !== undefined) assertSupportedEncoding(encoding)`). `digest`/`encryption` decide per their own contracts whether they share such a sentinel.

## Migration Plan

1. Implement `assertSupportedEncoding` in `src/shared/encodings.ts` and export it.
2. Update `src/packages/random/bytes.ts` to delegate and remove the private set.
3. Add tests under `tests/shared/` and update `tests/random/`.
4. When `digest` and `encryption` contracts are proposed, reference this helper in their designs.

## Open Questions

None. All material decisions are resolved above.
