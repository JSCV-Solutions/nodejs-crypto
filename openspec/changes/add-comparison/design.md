# Design

## Context

See proposal.md (Why) for motivation. Current state: `src/packages/comparison/index.ts` is a repository-tooling placeholder exporting a dummy `namespace` constant. Constraints: `node:crypto` is the only provider, erasable syntax with `.ts` import extensions, interfaces and type aliases in `typings/` consumed via `import type`, functional exports only, strict `INVALID_ARGUMENT` validation with hygienic messages, and full async plus `Sync` variant parity. Downstream consumers (`message-authentication` verification, password-hash verification) will call this namespace with secrets, MACs, tags, and hashes.

## Goals / Non-Goals

**Goals:**

- Map same-length equality to exactly one audited primitive: `node:crypto` `timingSafeEqual`.
- Honor the approved API: `equals(first, second): Promise<boolean>` plus `equalsSync(first, second): boolean`, both over `CryptoInput`.
- Return `false` (not throw) on byte-length mismatch; throw `InvalidArgumentError` only for non-`CryptoInput` operands.

**Non-Goals:**

- No new error codes, no new encodings, no algorithm identifiers, no changes to `shared-core` or `source-layout`.
- No HMAC verification, password-hash parsing, or encryption helpers; no docs-site work beyond JSDoc (the site lands in change 20).

## Decisions

### Delegate same-length equality to `timingSafeEqual`, no wrapper layer

`equalsSync` normalizes both operands with shared `toBytes`, returns `false` when byte lengths differ, otherwise returns `node:crypto` `timingSafeEqual(a, b)`. `equals` is an `async` function awaiting the same steps so results and error codes match exactly. There are no default parameters to choose (a comparator takes no strength knobs), so no OWASP lookup applies; the justification source is the Node.js `node:crypto` documentation (`timingSafeEqual` constant-time guarantee) plus CWE-208 for the threat being mitigated.

- Rejected: `===` / `Buffer.equals` fast path for the equal case. Both exit early on mismatch and leak prefix length through timing (CWE-208).
- Rejected: hand-rolled XOR-accumulator loop. Forbidden by AGENTS.md rule 4 and unauditable next to the platform primitive.
- Rejected: WebCrypto `subtle.timingSafeEqual` indirection. No benefit in a Node-24-only library and a second provider surface to audit.

### `false` on length mismatch instead of throwing

`timingSafeEqual` throws when lengths differ, so the namespace checks `a.length !== b.length` first and returns `false`. Lengths of hashes, tags, and MACs are fixed-width public metadata, not secrets, and every downstream verifier treats "wrong length" as "not equal" rather than a programming error. Throwing here would also force HMAC/password verifiers to catch and map the error on every wrong-length candidate.

- Rejected: propagating the `timingSafeEqual` length error. Leaks a Node `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` type and breaks the stable-code contract.
- Rejected: padding the shorter operand to force a constant-time compare. Adds dummy work for no security gain (length is already observable) and risks implying length-hiding that does not exist.
- Rejected: new `LENGTH_MISMATCH` error code. One boolean already answers verification; a second code complicates every caller for no benefit.

### Full async plus `Sync` parity (no `uuid`-style exception)

Unlike `random`'s sync-only `uuid` (sync Node primitive with no async value), comparison keeps both `equals` and `equalsSync` per `shared-core`: verifiers in async call chains need `await equals(...)` without dropping into sync, and the async form costs one promise allocation over the same logic. `equals` is declared `async` and shares the validation path, so error codes match exactly.

- Rejected: sync-only `equalsSync`. Breaks `shared-core` parity and forces async verifiers onto the sync spelling.
- Rejected: separate validation logic per variant. Duplication risks divergent error codes; a single path keeps parity by construction.

### Validate types with shared `toBytes`, fixed messages

Both operands go through the existing shared `toBytes` normalizer (copies bytes, so later caller mutation cannot affect the result). Non-`CryptoInput` operands throw the shared `InvalidArgumentError` with a fixed message naming the expected types and never interpolating operand values. No per-operand error distinction (first vs second) that could leak which side was malformed in a verifier context.

- Rejected: inline `typeof`/`instanceof` checks per file. Duplicates the already-tested shared normalizer and its copy semantics.
- Rejected: messages echoing received types or lengths. Type names are safe but add no value; lengths stay out of messages by hygiene convention.

### No known-answer vectors in the digest sense

A comparator has no RFC/NIST vectors to assert. Tests use fixed public fixtures as the analogue: equal/mismatched pairs across string/Buffer/Uint8Array forms, UTF-8 multibyte pairs, empty inputs, length-mismatch pairs, and one long pair differing only in the final byte, plus `INVALID_ARGUMENT` cases and async/sync parity for every class. All fixtures are non-secret synthetic values.

## Risks / Trade-offs

- [Length check short-circuits before the constant-time compare] → Accepted and documented: lengths of hashes/tags/MACs are public; the spec states mismatch returns `false`.
- [`timingSafeEqual` throws on zero-length or mismatched views if misused] → Mitigation: length gate first; same-length path only ever passes equal-length Buffers from `toBytes`.
- [Async wrapper implies I/O where none exists] → Mitigation: document that `equals` wraps the synchronous primitive for call-chain ergonomics; no behavioral difference from `equalsSync`.
- [Caller mutates a Uint8Array mid-compare] → Mitigation: `toBytes` copies on entry; comparison never reads caller-owned memory.

## Migration Plan

No migration. This adds a new subpath export and replaces an internal placeholder that was never a published API. Rollback is deleting the new files. No version bump or tag from this branch (releases are manual per AGENTS.md rule 12).
