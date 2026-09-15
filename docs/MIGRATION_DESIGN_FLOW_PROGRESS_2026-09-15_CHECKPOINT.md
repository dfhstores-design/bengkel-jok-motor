# Motokraf migration checkpoint — 2026-09-15

Status: **STAGING CANDIDATE IMPROVED — PRODUCTION DEPLOYMENT NOT APPROVED; READ-ONLY BACKUP COPY CREATED**

This checkpoint records each work stage completed after approval of the monthly PDF and Excel output. It separates refreshed evidence from historical baseline evidence and preserves the remaining production gates.

## Repository and preserved local work

| Item | Current evidence |
|---|---|
| Repository | `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\repo-checkout` |
| Branch | `codex/operator-idle-timeout-2026-09-15` |
| Source HEAD captured in the first checkpoint copy | `ea1a940` — `Update candidate lineage for reliability fixes`; checkpoint copy was committed as `a79ae47` |
| Deployed candidate code commit | `8f0c529` — `Retry idempotent staging mutations` |
| Latest Vercel Preview | `https://aplikasi-bengkel-staging-20260912-iadi01rsv-dfhstores-projects.vercel.app` — deployment `dpl_H9hwFwN5CgxkV4WxorhV1gmTq2rk`, READY |
| Staging Apps Script | Version 28 — `Payment-date report periods staging 2026-09-15`; the latest Preview is paired to v28 |
| Existing local changes preserved | `.gitignore`, `frontend/.gitignore`, prior progress checkpoint, and three user screenshots remain uncommitted and unmodified by this work. |

## Work stages

### Stage 1 — User approval and scope

- User approved the staging candidate and operational flow.
- Actual Owner/Operator idle-expiry waiting was explicitly marked **SKIP by user approval**.
- User approved the PDF and Excel output after the monthly report repair.
- Dashboard Owner and Operator visual/components remain unchanged.

### Stage 2 — Monthly report export repair

- Replaced the legacy PDF string builder with byte-accurate offsets and stream lengths, escaped PDF text, and automatic multi-page detail output.
- Added matching `SUMMARY BULANAN` to PDF and Excel with Pendapatan (Payment), Pengeluaran, Selisih hasil usaha (Pendapatan minus Pengeluaran), and Job CLOSED count; detailed Job rows follow.
- QPDF structural check passed on a generated 2-page sample. Excel content assertions passed.
- User approved PDF and Excel correctness.

### Stage 3 — Period consistency

- Report income, CLOSED history period membership, and the financial closed-job count now follow the linked Payment date. Unpaid CLOSED jobs remain visible as inconsistencies by their closed date.
- The `Semua data` preset now starts at `1900-01-01`, no longer truncating records from before 2020.
- Regression tests cover a Payment date that differs from the Job close date and an unpaid CLOSED Job.
- Change deployed only to staging Apps Script version 28 and paired with Vercel Preview. No production Apps Script or data was changed.

### Stage 4 — POST reliability

- Vercel backend relay retries once on transient server failures only for POST requests containing a non-empty `idempotency_key`.
- Existing idempotency-keyed Job, Payment/Close Job, Expense, media, receipt, and history-edit requests may safely use this retry.
- PIN updates and any POST without an idempotency key remain single-attempt.
- Unit tests prove retry on a transient 503 for keyed writes and no retry for non-idempotent POST. This is implementation evidence; a controlled staging transient-recovery E2E has not yet been recorded.

### Stage 5 — Production read-only identity and integrity review

- Refreshed the production Vercel alias: `https://aplikasi-bengkel-sprint0.vercel.app`; current deployment `dpl_B7CfXhY12Zzedq2SiGKSc52DXgyn` is READY/Production.
- Current production Apps Script version, Sheet identity, Drive media mapping, and permissions could not be freshly verified from available authenticated project configuration. Marked **OPEN**, without guessing identifiers.
- The 2026-09-11 historical XLSX backup remains readable. Its SHA-256 remains `444456363297C897A118210F6EDDC01717856C0276EDF4A0B2009E0533BDA587`. It contains Jobs 28, Payments 28, Expenses 14, Media 0.
- Refreshed comparison through read-only production GET: Jobs 28→36; Payments 28→36; Expenses 14→23; Media 0→0. No old IDs missing, no duplicate IDs, and no business-content differences for the records common to backup and live. All Job details were readable; Payment→Job mismatch 0; Media→Job mismatch 0; dashboard/recap inconsistencies 0.
- New operational records after the historical backup explain the extra IDs. The historical backup is not adequate for a future production release.
- The first integrity audit timed out while reading Job details. The audit utility was hardened with bounded retries, 45-second request timeout, and concurrency reduced from 8 to 3; the retry run then completed. Both runs were read-only.

### Stage 6 — Backup and rollback preparation

- Added a runbook for a fresh timestamped backup, SHA-256, tab/header/count/ID/relation checks, promotion gates, read-only smoke, and rollback to the prior READY Vercel deployment.
- A current read-only production backup was made after the user explicitly requested it: Drive copy and local XLSX export are recorded in Stage 8. This backup does not authorize or perform deployment. Repeat the backup immediately before a separately approved production deployment if the dataset changes in the meantime.
- Rollback action is documented as re-pointing the production alias to a pre-recorded READY Vercel deployment; it must not overwrite Sheet data.

### Stage 7 — Documentation alignment

- Corrected the gap register and this checkpoint to identify Apps Script staging version 28, the READY Preview deployment `dpl_H9hwFwN5CgxkV4WxorhV1gmTq2rk`, and the code commit that deployment contains (`8f0c529`).
- Preserved the distinction between the deployed code commit, documentation commits, and the earlier approved/skip decisions.
- Re-read the checkpoint from Drive after updating it; the Drive copy is being replaced in place so the existing checkpoint link remains stable.

### Stage 8 — Current production backup and validation

- Source verified read-only as native spreadsheet `MVP Data Store - v1` in the production data folder, with tabs Jobs, Payments, Expenses, and Media; workbook locale/timezone en_US / Asia/Jakarta.
- Created a full Drive copy `BACKUP_PRODUCTION_MVP_DATA_STORE_20260915_2241_WIB` in the same folder as the source. The local XLSX export is also stored in the checkpoint Drive folder [here](https://docs.google.com/spreadsheets/d/1ZgHPkTnu7oQuAY8H3U37PjmbqA3hLnG9/edit?usp=drivesdk). No source-sheet cells, schema, permissions, or operational records were changed.
- Exported the copy to a readable local XLSX at `D:\\Documents\\AI-GPT\\Aplikasi Bengkel Jok Motor\\backups\\BACKUP_PRODUCTION_MVP_DATA_STORE_20260915_2241_WIB.xlsx`; size 15,831 bytes; SHA-256 `49E4DEE7DBD3C144527EDC6D4BE639DCA842472DF99FB69DF9529A05B5587813`.
- Re-read all 4 native tabs from both production source and Drive copy: values matched exactly. Local XLSX read-back found Jobs 39 (39 unique IDs), Payments 39 (39 unique IDs), Expenses 26 (26 unique IDs), Media 0; duplicate IDs 0 in each tab. Payment-to-Job orphan references: 0; Media rows/orphan references: 0. Headers and aggregates are recorded in `PRODUCTION_BACKUP_VALIDATION_2026-09-15.md`.
- Source read and complete-copy comparison occurred around 2026-09-15 22:41 WIB. Any operational writes after that point will not be part of this snapshot; repeat backup immediately before an approved rollout if required.

## Verification summary

- Node tests: **13/13 PASS**.
- Frontend typecheck: **PASS**.
- PDF: QPDF structure check **PASS**; report summary asserted.
- Excel: report summary/detail content asserted **PASS**.
- Apps Script source syntax check: **PASS** before staging version 28 deploy.
- Vercel candidate preview: **READY**.
- Production audit: read-only refreshed baseline **PASS WITH LIMITATION**; legacy endpoint exhibited a detail GET timeout on the first attempt, and the audit completed after retry/concurrency hardening.
- Production backup copy/export: **PASS** (read-back and exact native source-copy values match).
- Production deployment, production write probe, schema change, cleanup, and operational data mutation: **NOT PERFORMED**.

## Remaining gaps before any production approval

1. Verify the production Apps Script deployment/version, Sheet, Drive media resources, and permissions using authenticated read-only access.
2. Perform authenticated staging E2E across all period presets and custom range; compare cards, tables, chart per-day values, report values, and browser-download files.
3. Exercise idempotent POST retry recovery end-to-end on isolated staging with a bounded synthetic marker; preserve all existing staging synthetic data.
4. Immediately before any separately approved production rollout, create and verify a new timestamped production backup and re-record the prior Vercel rollback deployment.
5. Do not deploy production until a distinct explicit production deployment approval is received.

## Related evidence

- [Gap register](MIGRATION_DESIGN_FLOW_GAP_REGISTER_2026-09-15.md)
- [Staging validation](MIGRATION_DESIGN_FLOW_STAGING_VALIDATION_2026-09-15.md)
- [Production read-only preflight](PRODUCTION_READONLY_PREFLIGHT_2026-09-15.md)
- [Production backup validation](https://drive.google.com/file/d/1pHYe7UQ_f_eLpGw7_-CI95_Qm8Sg4P5k/view)
- [Production backup and rollback runbook](https://drive.google.com/file/d/1y4y6TNYKvcYUFNW5xK8NNV067o_zwNuu/view)
- Read-only integrity output: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\qa-evidence\production-integrity-readonly-retry-20260915.json`

## Safety statement

Production application, Apps Script, source Sheet contents, schema, operational rows, IDs, timestamps, statuses, Payment values, and relationships were not changed. A separate read-only backup copy was created as requested. No production API write or cleanup endpoint was called. Existing local uncommitted user changes remain preserved.
