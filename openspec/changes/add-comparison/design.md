# Design

## Context

See proposal.md (Why) for motivation. Current state: `src/packages/comparison/index.ts` is a repository-tooling placeholder exporting a dummy `namespace` constant. Constraints: `node:crypto` is the only provider, erasable syntax with `.ts` import extensions, interfaces and type aliases in `typings/` consumed via `import type`, functional exports only, strict `INVALID_ARGUMENT` validation with hygienic messages, and full async plus `Sync` variant parity. Downstream consumers (`message-authentication` verification, password-hash verification) will call this namespace with secrets, MACs, tags, and hashes.

## Goals / Non-Goals

**Goals:**

- Map same-length equality to exactly one audited primitive: `node:crypto` `timingSafeEqual`.
- Honor the approved API: `equals(first, second): Promise<boolean>` plus `equalsSync(first, second): boolean`, both over `CryptoInput`.
- Return `false` (not throw) on byte-length mismatch; throw `InvalidArgumentError` only for non-`CryptoInput` operands.
- Make the published declarations of every namespace resolve for consumers, and keep them that way.

**Non-Goals:**

- No new error codes, no new encodings, no algorithm identifiers, no changes to `shared-core`.
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

### A namespace exports only its own type declarations

`comparison` declares no type of its own, so its entry point exports only `equals` and `equalsSync`. It does not re-export the shared `CryptoInput` type it consumes internally.

- Rejected: re-exporting `CryptoInput` from the `comparison` entry point. A namespace re-exporting a type it does not own duplicates the shared declaration in the public surface and makes the same question open for every namespace (`random` already re-exports its own `IntegerOptions`, which is a different case: that type belongs to `random`).
- Rejected: a package-local `typings/inputs.d.ts` that only re-exports the shared type. It adds a file that owns nothing, and `tsc` does not re-emit declaration inputs, so the re-exported path would not exist in the built output.
- Rejected: giving `comparison` its own operand type alias. Two names for `string | Buffer | Uint8Array` would drift from the shared `shared-core` input contract.

### The build copies every `typings/` folder, not just the shared one

`write-dist-package-json.mjs` walks `src/` for every folder named `typings` and copies it into each output tree, preserving the relative path. The previous script copied only `src/shared/typings`, so `src/packages/random/typings/integer.d.ts` never reached `dist` and the emitted `random` declarations referenced a missing module (`TS2307`) for every consumer. The defect shipped in `1.0.0-rc.2`.

- Rejected: copying the package folders by hard-coded list. Every new namespace would need a line in the build script, and the omission would be silent.
- Rejected: emitting declarations from the runtime modules instead of hand-written `.d.ts` files. That would undo the `source-layout` decision to keep interfaces in `typings/` folders.

### The smoke test type-checks the published declarations

`smoke-dist.mjs` now generates a consumer program that imports every namespace, references each expected function and type, and type-checks it with TypeScript 7 against the built output. The program is compiled once as `.ts` and once as `.cts`, so both the `import` and the `require` conditions of the `exports` map are exercised. The runtime import check could not catch the missing declaration file, because the runtime code does not depend on the `.d.ts` files.

- Rejected: a separate test file under `tests/`. The defect only exists in the built output, and `pnpm test` runs against the sources without a build.
- Rejected: checking only the ESM tree. The `require` condition resolves to a different `dist/cjs` tree with its own copied declarations.

## Risks / Trade-offs

- [Length check short-circuits before the constant-time compare] → Accepted and documented: lengths of hashes/tags/MACs are public; the spec states mismatch returns `false`.
- [`timingSafeEqual` throws on zero-length or mismatched views if misused] → Mitigation: length gate first; same-length path only ever passes equal-length Buffers from `toBytes`.
- [Async wrapper implies I/O where none exists] → Mitigation: document that `equals` wraps the synchronous primitive for call-chain ergonomics; no behavioral difference from `equalsSync`.
- [Caller mutates a Uint8Array mid-compare] → Mitigation: `toBytes` copies on entry; comparison never reads caller-owned memory.
- [The build script now walks the source tree] → Mitigation: the walk is a one-level-per-directory recursion over `src/`, which holds a handful of folders; the copy stays inside `dist/`.
- [The smoke test now needs the TypeScript 7 binary] → Mitigation: it resolves `typescript-7/package.json` from the installed dependencies, the same package the build uses.

## Migration Plan

No migration. This adds a new subpath export and replaces an internal placeholder that was never a published API. The build and smoke changes only affect what reaches `dist/`, so consumers of a future release get resolving declarations; a consumer pinned to `1.0.0-rc.2` keeps the broken `random` types until they upgrade. Rollback is deleting the new files. No version bump or tag from this branch (releases are manual per AGENTS.md rule 12).
