# INVENTORY — generated, do not hand-edit

**Regenerate:** `node scripts/build-inventory.mjs` · **Verify fresh:** `--check` · commit `efdc4af`

This file exists so that **"does X exist?" is a lookup, not a guess.** Asserting an absence after an
incomplete search is one of the five failure classes in `POST-MORTEM.md`, and the most expensive
instance was searching four names for a usage log, missing `verdict_logs` by one character, and
telling the founder we had no telemetry at all.

**Before writing "there is no ...", look here. A grep that finds nothing proves you did not find it.**

## Production tables (1) — from `demand-intel/db/schema.py`

- `(demand-intel/db/schema.py not readable from here)`

## Check scripts (8)

- `scripts/check-agent-isolation.mjs`
- `scripts/check-duplicate-logic.mjs`
- `scripts/check-extension.mjs`
- `scripts/check-market-proof-grain.mjs`
- `scripts/check-silent-failure.mjs`
- `scripts/check-stale-gates.mjs`
- `scripts/check-tracked-figure.mjs`
- `scripts/check-warehouse.mjs`

## npm scripts (20)

- `build`
- `check:dupes`
- `check:extension`
- `check:gates`
- `check:inventory`
- `check:isolation`
- `check:isolation:built`
- `check:market-proof`
- `check:silent`
- `check:tracked`
- `check:tracked:built`
- `check:warehouse`
- `dev`
- `lint`
- `seo:indexnow`
- `start`
- `test:e2e`
- `test:e2e:prod`
- `test:e2e:required`
- `test:unit`

## CI workflows (3)

- `.github/workflows/agent-isolation.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/playwright.yml`

## Company docs (54)

- `docs/company/ACCESS.md`
- `docs/company/ACTIVATION.md`
- `docs/company/AMENDMENTS.md`
- `docs/company/APPROVALS.md`
- `docs/company/AUTONOMY.md`
- `docs/company/CHECKS.md`
- `docs/company/CLOSED-LOOP.md`
- `docs/company/COMPLIANCE.md`
- `docs/company/CONTENT-FACTS.md`
- `docs/company/CONTENT-RULES.md`
- `docs/company/DECISIONS.md`
- `docs/company/DISK-TREND.md`
- `docs/company/DOCTRINE.md`
- `docs/company/ESCALATION.md`
- `docs/company/FIRST-REVENUE.md`
- `docs/company/FORENSIC-AUDIT.md`
- `docs/company/FUNNEL-BASELINE.md`
- `docs/company/GAPS.md`
- `docs/company/GOALS.md`
- `docs/company/GREY-AREA-FINDING.md`
- `docs/company/GTM.md`
- `docs/company/LEDGER.md`
- `docs/company/METRICS.md`
- `docs/company/MIGRATION-REPORT.md`
- `docs/company/MISSION.md`
- `docs/company/OBJECTIVE.md`
- `docs/company/OPEN-ITEMS.md`
- `docs/company/OPENCLAW.md`
- `docs/company/ORG.md`
- `docs/company/ORGANIC-GROWTH.md`
- `docs/company/OS.md`
- `docs/company/PATH-TO-TEN.md`
- `docs/company/PLATFORM-CREATIVE.md`
- `docs/company/PORTFOLIO-GATE.md`
- `docs/company/POST-MORTEM.md`
- `docs/company/PRICING-PROPOSAL.md`
- `docs/company/REDDIT-CLEARANCE.md`
- `docs/company/ROOT-CAUSE.md`
- `docs/company/SECURITY-LOG.md`
- `docs/company/SEO-STATE.md`
- `docs/company/SESSION.md`
- `docs/company/STATUS.md`
- `docs/company/THE-REAL-PROBLEM.md`
- `docs/company/UNIT-ECONOMICS.md`
- `docs/company/UX-RULES.md`
- `docs/company/WHY-BUY-NEVER-FIRES.md`
- `docs/company/WHY-WORK-STALLS.md`
- `docs/company/WORKBOARD.md`
- `docs/company/WORKFLOW.md`
- `docs/company/archive/DIGEST-2026-09-01.md`
- `docs/company/archive/OS-COMPLIANCE.md`
- `docs/company/archive/README.md`
- `docs/company/archive/RELEASE-A13-GATE.md`
- `docs/company/archive/RELEASE-NOTE-A13-GATE.md`
