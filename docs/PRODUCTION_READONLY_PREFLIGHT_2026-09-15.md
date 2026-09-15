# Motokraf production read-only preflight — 2026-09-15

Status: **PARTIAL PASS — PRODUCTION DEPLOYMENT REMAINS UNAUTHORIZED**

All checks in this report used production GET/read-only access only. No production deployment, write request, schema change, cleanup request, or operational-data edit was performed.

## Production identity and rollback lineage

| Gate | Result | Evidence refreshed now |
|---|---|---|
| Production URL | PASS | `https://aplikasi-bengkel-sprint0.vercel.app` returned HTTP 200. |
| Active Vercel deployment | PASS | `dpl_B7CfXhY12Zzedq2SiGKSc52DXgyn`, Production, READY; its alias is the production URL. |
| Prior Vercel rollback candidates | PASS WITH LIMITATION | Multiple earlier READY production deployments remain listed. The exact rollback deployment must be recorded again immediately before release. |
| Current production Apps Script version, Sheet identity, and Drive media identity | BLOCKED | Historical evidence exists, but no current authenticated Apps Script production configuration was available in this checkout for a fresh identity verification. No guess was made. |
| Production public-read exposure | OPEN RISK | The read-only audit reached the legacy production API without an authenticated production session. The staged candidate has server-side session gating; production remains unchanged. |

## Historical backup read-back

The retained `BACKUP_PRODUCTION_MVP_DATA_STORE_2026-09-11_2355.xlsx` file remains readable. Its SHA-256 still matches the recorded historical value. Read-back found Jobs 28 rows, Payments 28, Expenses 14, and Media 0.

This is **not** a release-time backup. It is retained only as a historical comparison point. A new timestamped backup/export, hash, tab/header check, unique-ID check, relationship check, and read-back are mandatory immediately before any production rollout.

## Refreshed integrity comparison

The read-only audit retried transient GET failures and reduced detail-read concurrency. It completed successfully against production and the historical backup.

| Entity | Backup | Current live | Missing live | Extra live | Duplicate IDs | Existing-row business content |
|---|---:|---:|---:|---:|---:|---|
| Jobs | 28 | 36 | 0 | 8 | 0 | MATCH |
| Payments | 28 | 36 | 0 | 8 | 0 | MATCH |
| Expenses | 14 | 23 | 0 | 9 | 0 | MATCH |
| Media | 0 | 0 | 0 | 0 | 0 | MATCH |

All live history Job details were readable. Payment-to-Job mismatches, Media-to-Job mismatches, dashboard inconsistencies, and recap inconsistencies were all zero.

The extra IDs are legitimate operational changes after the 11 September backup; they are not migration changes. Therefore this result is a **historical-baseline refresh**, not proof that the current live dataset is backed up for release.

## Candidate reliability and period work

| Item | Status | Evidence |
|---|---|---|
| Safe retry for idempotent mutation POST | PASS IMPLEMENTATION / STAGING READY | The Vercel relay now retries once only when the request body contains an idempotency key. Job, Payment/Close Job, Expense, media, receipt, and history-edit writes already use server-side idempotency. PIN changes and other non-idempotent POSTs remain single-attempt. |
| POST retry regression | PASS LOCAL | Test proves a transient 503 is retried for an idempotent POST and never retried for a non-idempotent POST. |
| Apps Script staging | PASS | Version 28, `Payment-date report periods staging 2026-09-15`, is paired with the latest preview environment. |
| Period source consistency | PASS LOCAL / STAGING READY | Summary income, report history, and closed-job period filtering now use linked Payment date. Expenses retain expense date. Preset `Semua data` now starts at 1900-01-01 rather than 2020-01-01. |
| Period regression | PASS LOCAL | Tests cover payment date different from Job closed date and an unpaid CLOSED Job inconsistency. |

## Remaining release gates

1. Fresh authenticated production Apps Script, Sheet, and Drive identity/permission verification.
2. New timestamped production backup and read-back immediately before release.
3. Controlled staging POST recovery evidence for the retry path, using an existing idempotency-safe synthetic marker and without deleting existing data.
4. Fresh authenticated staging verification across all period presets, custom range, table/card/chart/report consistency, and browser download events.
5. Production deployment approval after the items above are complete.

## Rollback

Follow [PRODUCTION_RELEASE_BACKUP_ROLLBACK_RUNBOOK.md](PRODUCTION_RELEASE_BACKUP_ROLLBACK_RUNBOOK.md). The first rollback action is a Vercel alias re-point to the pre-recorded READY deployment. It does not overwrite Sheet data.
