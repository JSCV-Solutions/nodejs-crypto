# Design

## Context

The repository is a PNPM workspace (root library + `docs`), with `package.json` `exports` mapping the seven namespace subpaths to `dist/esm` and `dist/cjs`. Fallow auto-detects entry points from `package.json` (including conditional `exports`) and maps `dist/` paths back to `src/`. ESLint/Prettier/tsc/Node test runner already gate PRs. CI runs under `permissions: contents: read`. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**

- A committed, reviewable Fallow configuration that makes the public `exports` surface visible and ignores non-library trees.
- A changed-code gate on pull requests that fails only on error-severity findings, with a PR comment summary.
- A documented adoption path and dependency approval.

**Non-Goals:**

- Fixing the findings the first full-repo run reports (separate, agent-assisted step).
- Runtime/production coverage monitoring or mutation testing.
- CSS/styling analysis (disabled in the first rollout).

## Decisions

- **Config surface: `fallow.toml` at the repo root.** Rejected: `.fallowrc.json`/`.fallowrc.jsonc` (JSONC is the higher-precedence default and `fallow init` writes it, but TOML matches the repository's preference for readable, comment-friendly config and avoids editor schema friction); starting from `fallow init` output (rejected: hand-written config lets every field be justified and reviewed). Explicitly set fields: `entry`, `ignorePatterns`, `ignoreDependencies`, `ignoreExportsUsedInFile`, `publicPackages` is not needed because `exports` auto-detection covers the public surface, `typeAware`, `rules`, `duplicates`, `health`, `audit`. Everything else stays at defaults.
- **Entry points, ignores and visibility.** Entry points are auto-detected from `package.json` `exports` (each `./<namespace>` maps to `src/packages/<namespace>/index.ts`); add `entry = ["tests/**/*.test.ts", "scripts/*.mjs"]` for test files and repo scripts that Fallow would otherwise treat as unreachable. `ignorePatterns = ["openspec/**", "docs/**", "**/*.generated.ts"]` (`dist/` is already built-in). No JSDoc visibility tags (`@public`/`@internal`/`@expected-unused`) in the first rollout because the `exports` map is the source of truth for the public API; inline `// fallow-ignore-next-line` is allowed for intentional exceptions. Rejected: declaring every namespace index in `entry` manually (duplicates auto-detection and drifts from `exports`); `ignoreExports` with `exports: ["*"]` on index files (would hide real unused internal exports).
- **Type-aware analysis: `best-effort`.** `projects = ["tsconfig.json"]`, `require = "best-effort"`. Rejected: `complete` (Fallow's companion performs its own TypeScript pass; the repo uses TypeScript 7.0.2 with `erasableSyntaxOnly` and `nodenext`, so an incomplete pass would fail the gate on valid code; best-effort keeps conservative findings instead).
- **Rules and severity rollout.** Start permissive and promote after the cleanup step, per Fallow's incremental adoption guidance:
    - Dead code: `unused-files = "error"`, `unused-exports = "error"`, `unused-types = "warn"`, `unused-dependencies = "error"`, `unresolved-imports = "error"`, `unlisted-dependencies = "error"`, `duplicate-exports = "error"`, `circular-dependencies = "warn"`, `stale-suppressions = "warn"`.
    - Diff-risk (opt-in, `warn`): `weakened-tests`, `added-suppression`, `test-only-branch`.
    - Health thresholds: `maxCyclomatic = 20`, `maxCognitive = 15`, `maxCrap = 30`; `complexity-cyclomatic = "error"`, `complexity-cognitive = "warn"`, `complexity-crap = "warn"`.
    - Duplication: `mode = "mild"`, `minTokens = 50`, `minLines = 5`, `threshold = 0` (no percentage limit in the first rollout).
    - CSS/styling rules and opt-in rules (`private-type-leaks`, `prop-drilling`, `coverage-gaps`, `feature-flags`, `security-*`, `added-dependency`, `diverged-clone-sibling`) stay `off`.
    - Rejected: promoting all rules to `error` immediately (too noisy for a first run); turning styling analysis on (out of scope for a crypto library with no CSS).
- **Adoption path: one-time cleanup first.** Run the full-repo analysis locally, fix all findings in a separate agent-assisted step, then enable the gate with `all` mode and no baselines. Rejected: committed baselines (they would mask existing findings and require maintaining baseline files; cleanup-first gives a clean gate and matches the issue's out-of-scope cleanup step). Note: fixes are applied locally, not by CI.
- **Gate and thresholds: `audit.gate = "all"`** (no `new-only`). Rejected: `new-only` (appropriate with baselines; without baselines, `new-only` would silently allow pre-existing findings on touched files to pass, defeating the cleanup-first goal).
- **Coverage input for CRAP: static estimate.** No `NODE_V8_COVERAGE` capture and no `--coverage` flag. Rejected: V8 coverage capture (the Node built-in runner can emit it, but capturing and merging it adds CI plumbing and runtime overhead for a library that deliberately has no coverage threshold and keeps tests fast; static estimate is sufficient for a quality gate).
- **CI wiring: plain `npx fallow` step, not the official Action.** The job runs `npx --yes fallow@<pinned> audit --format github-summary` and posts the summary via `gh pr comment` using `GITHUB_TOKEN`. The job requests `contents: read` and `pull-requests: write` (only this job; the rest of the workflow stays read-only). Rejected: `fallow-rs/fallow@v3` Action (it needs `id-token: write`, `checks: write` and `security-events: write` for SARIF, which conflicts with the least-privilege posture of a security-focused library; the CLI gives the same analysis with fewer permissions). PR surface: comment summary. Rejected: check-only (less visible to reviewers), inline review comments (noisy), SARIF upload (requires `security-events: write` and a code-scanning surface not needed for this gate).
- **Local parity: `pnpm fallow` script plus pre-push gate.** Add `"fallow": "fallow audit"` to `package.json` scripts and a Husky `pre-push` hook running `pnpm fallow` alongside `pnpm lint` and `pnpm format:check`. Rejected: script only (local parity with CI is worth the extra run time for a quality gate).
- **Capability ownership: modify `repository-tooling`.** Rejected: a new `fallow`/`static-analysis` capability (AGENTS.md rule 9, one capability per change; Fallow extends the existing "Static quality gates" surface).
- **Privacy, provenance and licensing.** Fallow's basic analysis is free and runs fully offline; no license is required for the planned gate. CI sets `FALLOW_TELEMETRY_DISABLED=1` (and `DO_NOT_TRACK=1`) on the Fallow step. No network egress is allowed from the job. Rejected: allowing license-check egress (unnecessary because no licensed feature is used; would add a network dependency to a security-focused library's CI).
- **Dependency approval.** The maintainer approves adding `fallow` as a development dependency; implementation adds it to `devDependencies` and the corresponding `minimumReleaseAgeExclude` entries in `pnpm-workspace.yaml`, and pins the version used in CI.

## Risks / Trade-offs

- [Cleanup is large] → The first full-repo run may report many findings; the separate cleanup step is agent-assisted and may take multiple passes. Mitigation: keep the gate disabled until cleanup completes.
- [Fallow version drift] → Pinning a recent release requires `minimumReleaseAgeExclude` entries. Mitigation: record the exact version and update entries together.
- [Telemetry default] → Telemetry is off by default in CI, but set the env vars explicitly to be safe. Mitigation: `FALLOW_TELEMETRY_DISABLED=1` and `DO_NOT_TRACK=1` on the step.
- [Permission creep] → Posting a PR comment requires `pull-requests: write`. Mitigation: scope that permission to the Fallow job only.

## Migration Plan

1. Land this OpenSpec change.
2. Run the full-repo analysis locally and fix all findings (separate step).
3. Apply the change: add `fallow.toml`, the CI job, the root script, the pre-push hook, the dependency and workspace excludes.
4. Enable the gate with `all` mode.

## Open Questions

- Exact pinned Fallow version and its `minimumReleaseAgeExclude` entries (resolved at implementation time).
