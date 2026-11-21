# Design

## Context

See proposal.md (Why) for motivation. Current state: `src/packages/digest/index.ts` is the repository-tooling placeholder exporting a dummy `namespace` constant. Constraints: `node:crypto` is the only provider, erasable syntax with `.ts` import extensions, interfaces and type aliases in `typings/` consumed via `import type`, functional exports only, strict `INVALID_ARGUMENT` / `UNSUPPORTED_ALGORITHM` validation with hygienic messages, and full async plus `Sync` variant parity. `assertSupportedEncoding`, `toBytes` and `assertSupportedAlgorithm` already exist in `src/shared/`. Downstream consumers (`message-authentication`, and password hashing for MD5) will call this namespace.

## Goals / Non-Goals

**Goals:**

- Lock the `digest` public contract: `hash(algorithm, data, encoding?)` / `hashSync(...)` over `DigestAlgorithm`, with Buffer-by-default and encoded-text-on-request output.
- Validate inputs through the shared helpers and dispatch by algorithm, so `add-sha-2` and `add-md5` only replace a placeholder case.
- Export the `DigestAlgorithm` type from the namespace's own `typings/` folder.

**Non-Goals:**

- No digest computation in this change: every dispatch case throws an `UnsupportedAlgorithmError` until its algorithm change lands. No NIST vectors, no MD5 deprecation warning, no password-hashing form.
- No new error codes, no new encodings, no changes to `shared-core` or `source-layout`.
- No HMAC, password hashing, key derivation or encryption helpers; no docs-site work beyond JSDoc.

## Decisions

### Algorithm-first positional signature

`hash(algorithm, data, encoding?)` places the algorithm first, mirroring `node:crypto`'s `createHash(algorithm)` and the plan's "the algorithm the caller passes selects the behavior." The optional trailing encoding keeps the call site readable (`hash('sha-256', data, 'hex')`).

- Rejected: data-first with an options object (`hash(data, { algorithm, encoding })`). Less consistent with the existing positional style of `bytes(length, encoding?)` and `equals(first, second)`, and pushes the selecting parameter to the second position.
- Rejected: `hash(data, algorithm, encoding?)`. Algorithm is the selector and reads more naturally first; data-first would also make the encoding position ambiguous when omitted.

### Buffer by default, text on request

Overloads `hash(algorithm, data): Promise<Buffer>` and `hash(algorithm, data, encoding): Promise<string>` (same for `hashSync`), implemented by generating the digest once and passing it through the shared `encodeBytes` helper when an encoding is present. This matches `random.bytes` exactly.

- Rejected: string-only with default `hex`. Forces an encoding on binary consumers and churns memory for callers that only need bytes (for example, HMAC inputs built from digests).
- Rejected: Buffer-only. Pushes hex/base64/base64url handling onto every caller and duplicates the already-tested shared encoder.

### Dispatch skeleton with placeholder cases

`hashSync` validates arguments, then switches on `algorithm`; each case currently throws `UnsupportedAlgorithmError`. `add-sha-2` and `add-md5` replace their cases with `node:crypto` `createHash(...).update(data).digest()` (and, for MD5, the deprecation warning and password form). The case bodies are the only thing those changes touch in this file.

- Rejected: computing all three algorithms here. That would duplicate the algorithm work that `add-sha-2` and `add-md5` exist to own, and would let MD5 ship without its deprecation warning in the same change.
- Rejected: an empty supported list with no dispatch. Would make the `DigestAlgorithm` type and the validation list disagree, and would leave nothing for the later changes to "add" beyond tests.

### Full `DigestAlgorithm` set declared up front

The `DigestAlgorithm = 'md5' | 'sha-256' | 'sha-512'` union and the `assertSupportedAlgorithm` list both name all three identifiers now, matching the plan's algorithm list for 1.0.0. Runtime computation is gated by the placeholder cases, so the type and the validation list stay aligned while support is added change by change.

- Rejected: growing the union per algorithm change. Would churn the public type across three changes and break callers that referenced the full set early.

### Exported `DigestAlgorithm` type

`DigestAlgorithm` is digest-owned (it is not a shared type), so it is exported from the namespace entry point, mirroring `random` exporting `IntegerOptions`. It lives in `src/packages/digest/typings/digest.d.ts` and is consumed via `import type`.

- Rejected: keeping it internal (mirroring `comparison`). `comparison` exports nothing because its operand type is shared; here the algorithm set belongs to `digest`, so hiding it would force callers to inline the literal union and drift from the library's own spelling.

### Full async plus `Sync` parity

`hash` is an `async` function that awaits the same validation and dispatch path, so results and error codes match `hashSync` exactly. There is no sync-only exception here (unlike `random`'s `uuid`), because `node:crypto` hashing is synchronous and a single consistent spelling is simpler for async call chains.

- Rejected: sync-only `hashSync`. Breaks `shared-core` parity and forces async verifiers onto the sync spelling.

### Validate with shared helpers, fixed messages

Algorithm, data and encoding go through `assertSupportedAlgorithm`, `toBytes` and `assertSupportedEncoding` respectively. Non-`CryptoInput` data throws the shared `InvalidArgumentError` with a fixed message naming the expected types and never interpolating values; unsupported encodings and algorithms use their own stable messages naming the received value (algorithm and package names are public and safe per `shared-core`).

- Rejected: inline `typeof`/`instanceof` checks per file. Duplicates the already-tested shared normalizer and its copy semantics.
- Rejected: messages echoing data or digest bytes. Hygiene rule; lengths and values stay out of messages.

## Risks / Trade-offs

- [Placeholder cases throw `UnsupportedAlgorithmError` for identifiers the type advertises] → Accepted and documented: the type is the contract for 1.0.0, runtime support arrives in `add-sha-2` and `add-md5`. Callers see a stable code, not a crash.
- [Algorithm changes must touch this file's switch] → Mitigation: the case bodies are isolated and marked; `add-sha-2`/`add-md5` replace only their own cases plus add tests.
- [Async wrapper implies I/O where none exists] → Mitigation: document that `hash` wraps the synchronous primitive for call-chain ergonomics; no behavioral difference from `hashSync`.
- [Caller mutates a Uint8Array mid-hash] → Mitigation: `toBytes` copies on entry; hashing never reads caller-owned memory.
- [Encoding default ambiguity] → Mitigation: Buffer default is explicit in the overloads and JSDoc, matching `random.bytes`.

## Migration Plan

No migration. This adds a new subpath export and replaces an internal placeholder that was never a published API. Rollback is deleting the new files and restoring the placeholder. No version bump or tag from this branch (releases are manual per AGENTS.md rule 12).
