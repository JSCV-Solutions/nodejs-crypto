# Design

## Context

See proposal.md Why. Current state: no `SECURITY.md`, no `.github/dependabot.yml` (`.github/` contains only `workflows/`), and `package.json` already defines `audit:prod` as `pnpm audit --prod --audit-level high` but no CI job runs it. The release-pipeline change owns `ci.yml`, `release.yml`, and `docs.yml`; this change only adds one job to `ci.yml`. No cryptographic code changes. User answers confirmed: private reporting only, latest-minor support, weekly grouped Dependabot, fail on high or critical.

## Goals / Non-Goals

**Goals:**

- Document the reporting channel and support window so reporters and users know what to expect.
- Automate routine dependency updates without breaking the commit conventions.
- Enforce the existing audit script in CI with read-only permissions.

**Non-Goals:**

- Enabling private vulnerability reporting in repository settings (maintainer console action, not a file change).
- Adding secret scanning, CodeQL, SAST, license scanning, or auto-merge.
- Changing release signing, provenance, dist-tags, or any cryptographic default.

## Decisions

- **Private vulnerability reporting only.** `SECURITY.md` names the GitHub advisories flow and links to it. Rejected: publishing a security contact email, which invites plaintext secrets by email and needs mailbox ownership and rotation; rejected: asking for public issues, which discloses vulnerabilities before a fix.
- **Latest minor of the current major supported, fixes forward only.** Matches DEVELOPMENT_PLAN section 1 and keeps the maintenance burden to one line before 1.0.0. Rejected: supporting every patch line, which multiplies backports; rejected: promising response-time SLAs, which the maintainer has not committed to.
- **Weekly grouped Dependabot for the pnpm ecosystem.** Weekly cadence with grouped minor/patch updates limits pull request noise while keeping advisories visible; major updates stay ungrouped so breaking changes are reviewed individually. Rejected: daily ungrouped updates, which flood pull requests; rejected: monthly cadence, which leaves known advisories open longer. Dependabot commit prefix uses a `CHORE -` style header so the existing commitlint job passes; rejected: default Dependabot prefix, which violates the `<TYPE> - <Description>` pattern.
- **Separate CI audit job running `pnpm audit:prod`.** A dedicated `audit` job in `ci.yml` keeps the failure attributable and reuses the existing script (`--prod --audit-level high`) with read-only permissions, matching the least-privilege posture of the release-pipeline change. Rejected: folding the audit into the lint or test job, which hides the cause; rejected: auditing dev dependencies in the gate, which blocks merges on tooling advisories that never ship.
- **No cryptographic decisions in this change.** No primitives, parameters, or defaults are added or changed, so there are no rejected crypto alternatives and no default parameters to justify against OWASP. The audit gate cites OWASP Top 10 A06:2021 only as the rationale for failing on vulnerable components.

## Risks / Trade-offs

- [Private reporting must be enabled in repository settings] → Mitigation: call it out as a manual maintainer step in tasks.md and verify the `SECURITY.md` link resolves; the file alone cannot enable the feature.
- [Dependabot may not bump the `typescript` / `typescript-7` alias pair consistently] → Mitigation: known risk already recorded in DEVELOPMENT_PLAN section 8; grouped updates keep the pair in one pull request for manual review, and the CI matrix catches a split.
- [`pnpm audit` needs registry access and can fail on network errors] → Mitigation: the job fails visibly and is retried by re-running CI; no publish or deploy depends on it.
- [Audit gate blocks merges until advisories are resolved] → Mitigation: intended behavior; Dependabot pull requests provide the fix path, and the failure log names the advisory.

## Migration Plan

No migration. Adds two files and one CI job plus documentation links. Rollback is deleting the added files and job. No data, API, or release-flow changes.

## Open Questions

None.
