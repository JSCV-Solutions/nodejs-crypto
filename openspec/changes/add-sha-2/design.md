# Design

## Context

See proposal.md — Why. Current state: `src/packages/digest/hash.ts` validates arguments and dispatches by algorithm, but every case (`md5`, `sha-256`, `sha-512`) throws `UnsupportedAlgorithmError`. `assertSupportedAlgorithm`, `toBytes`, `assertSupportedEncoding` and `encodeBytes` already exist in `src/shared/`. The digest contract (change `add-digest-contract`) fixed the signature `hash(algorithm, data, encoding?)`, Buffer-by-default output, and full async/sync parity, and explicitly states that the case bodies are the only thing later algorithm changes touch. There are no parameters to choose for SHA-2 (FIPS 180-4 defines the algorithms fully), so no default-strength decision applies.

## Goals / Non-Goals

**Goals:**

- Replace the `'sha-256'` and `'sha-512'` placeholder cases with computation delegated to `node:crypto`.
- Keep the `'md5'` case throwing `UnsupportedAlgorithmError` until `add-md5`.
- Preserve validation, encoding, error codes and async/sync parity exactly as the contract defines them.
- Update JSDoc so the namespace no longer describes SHA-2 as pending.

**Non-Goals:**

- No new subpath export, type, error code, or encoding.
- No MD5 implementation, no HMAC, no password-hashing or key-derivation SHA usage.
- No change to `src/shared/`, the `digest` spec, or the `DigestAlgorithm` union.
- No splitting of SHA logic into separate files (see Decisions).

## Decisions

### Keep computation inline in `hash.ts` (rejected: per-algorithm files)

The digest contract's dispatch skeleton owns `src/packages/digest/hash.ts`, and its design states that `add-sha-2` replaces only the case bodies. Splitting SHA-256/SHA-512 into `src/packages/digest/sha-256.ts` / `sha-512.ts` would move validation and encoding out of the single dispatch path or require re-exporting helpers, duplicating the already-tested shared normalizer and increasing the surface for drift. The case bodies stay in `hash.ts`; tests stay in `tests/digest/hash.test.ts`, matching the source hierarchy.

- Rejected: `sha-256.ts` / `sha-512.ts` modules. Adds indirection and a second import site without changing observable behavior; the contract explicitly scopes the change to case bodies.

### Provider algorithm spelling: hyphenated identifiers

`createHash` is called with `'sha-256'` and `'sha-512'` (the hyphenated forms), matching the public `DigestAlgorithm` identifiers. Node accepts both the hyphenated and unhyphenated spellings with identical output (verified locally), so this is a readability choice, not a correctness one.

- Rejected: `'sha256'` / `'sha512'`. Equally correct; the hyphenated form mirrors the public identifier and keeps the call site self-documenting.

### Capture bytes once, before the switch

`hashSync` calls `toBytes(data)` a single time, stores the resulting Buffer, and reuses it both for the (already-performed) validation and for `createHash(...).update(bytes)` inside each case. The digest bytes are passed to `encodeBytes` when an encoding is requested, and returned directly otherwise, mirroring `random.bytes`. This avoids a redundant copy per hash call, which matters for the library's throughput on large inputs.

- Rejected: calling `toBytes` again inside each case. That would re-copy the caller's data a second time for no behavioral benefit; the contract's "case bodies are the only thing touched" invariant is preserved by having each case reference the captured `bytes` variable rather than recomputing it.

### Async variant wraps the sync primitive

`hash` remains an `async` function delegating to `hashSync`, unchanged from the contract. No separate async code path is introduced, so parity is structural rather than tested-into-existence.

- Rejected: computing asynchronously via `crypto.subtle`. Would add a second provider path and break the `node:crypto`-only rule.

### No parameters, no defaults

SHA-256 and SHA-512 have no tunable parameters (FIPS 180-4 fixes them). The OWASP default-raising rule does not apply; there is nothing to raise or lower across releases.

## Risks / Trade-offs

- [Existing digest tests assert `UnsupportedAlgorithmError` for SHA-256/SHA-512] → Those assertions are replaced by known-answer vectors and a single "MD5 still throws" assertion; the change updates `tests/digest/hash.test.ts` accordingly. No production behavior regresses — the identifiers move from "not yet implemented" to "implemented," which is the intended completion.
- [Vector typos in specs/tests] → Every expected digest in this change is verified against `node:crypto` output (recorded in the spec scenarios) before writing, so a mismatch fails the known-answer tests rather than shipping.
- [Hyphenated spelling assumed available in all supported Node versions] → Verified on Node 24.11.1 (the minimum is 24.7.0); both spellings are long-standing in `node:crypto`. No version-specific branching needed.

## Migration Plan

No migration. This completes an already-advertised identifier; callers that previously caught `UNSUPPORTED_ALGORITHM` for `'sha-256'`/`'sha-512'` will now receive a digest. Rollback is reverting the case bodies to throw and restoring the placeholder tests. No version bump or tag (releases are manual per AGENTS.md rule 12).

## Open Questions

None. All decisions are resolved; the change is ready for task breakdown.
