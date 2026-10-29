# Proposal

## Why

The repository has ESLint (typed), Prettier, `tsc`, the Node built-in test runner and a production dependency audit, but no static analysis for dead code, duplication or complexity, and no changed-code quality gate. `openspec/specs/repository-tooling/spec.md` already defines a "Static quality gates" requirement covering type errors, lint and formatting; Fallow would extend that surface with dead-code, duplication, complexity and diff-risk checks on pull requests. Fallow is a new third-party tool, so per AGENTS.md hard rule 3 it requires an explicit, recorded maintainer decision, and for a security-focused cryptography library its commercial nature, network egress and telemetry posture must be decided explicitly. This change defines that configuration.

## What Changes

- Add a Fallow configuration file (`fallow.toml`) at the repository root declaring entry points, ignores, type-aware analysis in `best-effort` mode, rule severities, complexity thresholds, duplication settings, and `audit.gate = "all"`.
- Declare the package's `exports` subpaths as Fallow entry points (auto-detected from `package.json`) and ignore non-library trees (`dist/`, `openspec/`, `docs/`, generated files).
- Adopt a one-time local cleanup before enabling the gate: no committed baselines; the gate turns on with `all` mode after cleanup lands in a separate step.
- Add a root `pnpm fallow` script and run it in the pre-push gate alongside `pnpm lint` and `pnpm format:check`.
- Add a Fallow job to `.github/workflows/ci.yml` running `npx fallow audit` (plain CLI, not the Action), posting a PR comment summary on pull requests (no comment on pushes to `main`), with `pull-requests: write` scoped to that job only; keep `contents: read` otherwise.
- Record the maintainer's approval of Fallow as a development dependency and the `minimumReleaseAgeExclude` entries needed for a recent release.
- Update `DEVELOPMENT_PLAN.md` section 6 backlog and the `CONTRIBUTING.md` scripts table when applied.
- Extend the `repository-tooling` capability's "Static quality gates" requirement with Fallow behavior.

## Capabilities

### New Capabilities

### Modified Capabilities

- `repository-tooling`: extend the "Static quality gates" requirement with Fallow dead-code, duplication, complexity and diff-risk gating on pull requests.

## Impact

- New config file `fallow.toml` at the repository root.
- New CI job in `.github/workflows/ci.yml`.
- New root script `pnpm fallow` and pre-push hook entry.
- New development dependency `fallow` (maintainer approval recorded in this change) plus `minimumReleaseAgeExclude` entries in `pnpm-workspace.yaml`.
- No changes to cryptographic primitives, public API or runtime behavior.
- No production dependency added; Fallow is a development-only tool.
