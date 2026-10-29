# Tasks

## 1. One-time cleanup (prerequisite for enabling the gate)

- [ ] 1.1 Run `npx fallow` over the repository root and capture the full finding set; verify the report is produced without errors
- [ ] 1.2 Fix all reported dead-code, duplication and complexity findings in a separate agent-assisted pass; verify `npx fallow` exits 0 on the clean tree
- [ ] 1.3 Confirm no baselines are needed; verify `git status` shows only the cleanup edits

## 2. Dependency approval and workspace pinning

- [ ] 2.1 Add `fallow` to `devDependencies` at a pinned version and verify `pnpm install --frozen-lockfile` succeeds
- [ ] 2.2 Add the corresponding `minimumReleaseAgeExclude` entries to `pnpm-workspace.yaml` and verify install succeeds on a clean checkout
- [ ] 2.3 Record the maintainer's approval in this change's artifacts; verify the change validates with `openspec validate --all --strict`

## 3. Fallow configuration

- [ ] 3.1 Create `fallow.toml` at the repository root with the entry points, ignores, type-aware `best-effort` settings, rule severities, thresholds and `audit.gate = "all"`; verify `fallow` runs and reports the resolved config via `fallow config`
- [ ] 3.2 Add `ignorePatterns` for `openspec/**`, `docs/**` and generated files; verify those trees are excluded from analysis
- [ ] 3.3 Set complexity thresholds (`maxCyclomatic = 20`, `maxCognitive = 15`, `maxCrap = 30`) and verify a function above them is reported
- [ ] 3.4 Add `entry = ["tests/**/*.test.ts", "scripts/*.mjs"]` and verify test files and scripts are no longer flagged as unused

## 4. Local parity

- [ ] 4.1 Add `"fallow": "fallow audit"` to the `scripts` in `package.json`; verify `pnpm fallow` runs
- [ ] 4.2 Add a Husky `pre-push` hook running `pnpm fallow` alongside `pnpm lint` and `pnpm format:check`; verify the hook runs on push

## 5. CI wiring

- [ ] 5.1 Add a `fallow` job to `.github/workflows/ci.yml` running `npx --yes fallow@<pinned> audit --format github-summary` with `contents: read` and `pull-requests: write` scoped to that job; verify the workflow YAML is valid
- [ ] 5.2 Post the summary via `gh pr comment` using `GITHUB_TOKEN`; verify a test pull request receives the comment
- [ ] 5.3 Set `FALLOW_TELEMETRY_DISABLED=1` and `DO_NOT_TRACK=1` on the step; verify the job completes without network access
- [ ] 5.4 Run `openspec validate --all --strict` in CI unchanged; verify it still passes

## 6. Documentation

- [ ] 6.1 Add `pnpm fallow` to the scripts table in `CONTRIBUTING.md`; verify the table renders
- [ ] 6.2 Update `DEVELOPMENT_PLAN.md` section 6 backlog with this change; verify the plan references it
- [ ] 6.3 Document the Fallow gate (command, scope, failure condition) in `CONTRIBUTING.md`; verify the docs are accurate

## 7. Validation

- [ ] 7.1 Run `openspec validate --all --strict` and verify it passes
- [ ] 7.2 Run `pnpm typecheck` and `pnpm test` to confirm no regressions; verify both pass
