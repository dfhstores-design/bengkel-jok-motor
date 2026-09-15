# Motokraf production backup and rollback runbook

Status: **PREPARATION ONLY — DO NOT EXECUTE WITHOUT EXPLICIT PRODUCTION DEPLOYMENT APPROVAL**

This runbook governs the final pre-release gate. It is intentionally separate from staging validation and does not authorize a production change.

## Preconditions

1. Record the current production Vercel alias, READY deployment ID, commit/source lineage, and its rollback deployment ID.
2. Record the exact production Apps Script deployment/version, Web App URL, Sheet identity, and Drive media root identity through authenticated read-only tools. Do not put credentials or full sensitive identifiers in the report.
3. Confirm that the target Vercel deployment is Preview-tested and that its production environment values will point to the verified production Apps Script only.
4. Confirm no Sheet schema, ID, timestamp, status, Payment, or relationship migration is included in the release.

## Required backup procedure

1. Make a new production spreadsheet copy/export before the first production deployment attempt.
2. Name it `BACKUP_PRODUCTION_MVP_DATA_STORE_YYYYMMDD_HHMM_WIB` and preserve both the Drive copy and the local XLSX export under `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\backups`.
3. Compute SHA-256 for the local export and read it back with a spreadsheet reader.
4. Record the expected tabs, row counts, header counts, unique ID counts, and duplicate counts for Jobs, Payments, Expenses, and Media.
5. Verify Payment-to-Job and Media-to-owner relationships from the backup. Save only aggregates/hashes in the validation report.
6. Treat a failed copy, unreadable export, missing tab, duplicate ID, or broken relation as a stop condition. Do not deploy production.

## Deployment and smoke procedure

1. Deploy a new production Vercel deployment; preserve the prior READY deployment and alias mapping.
2. Promote only after the exact deployment and production environment mapping are verified.
3. Run read-only smoke checks: page availability, authenticated session read, active Job list, CLOSED history, recap/dashboard, and report read.
4. Run the production integrity audit against the newly created backup. The acceptance requirement is no unexplained missing IDs, duplicates, relationship breaks, or business-content changes.
5. Do not create synthetic data, call cleanup endpoints, or make an unauthenticated write probe in production.

## Rollback decision and actions

Rollback is required if the deployed frontend cannot read data correctly, session/auth behavior fails, a read-only integrity check finds an unexplained difference, or the release maps to an incorrect backend.

1. Re-point the production alias to the preserved prior READY Vercel deployment.
2. If the backend mapping changed, re-point the frontend to the previously recorded Apps Script deployment/version only after read-only verification.
3. Do not overwrite Sheet data as part of frontend rollback.
4. Use the new timestamped backup only for comparison or a separately approved data recovery procedure.
5. Re-run read-only smoke and the integrity audit after rollback, then record the outcome.

## Current snapshot

A verified production copy/export was created at 2026-09-15 22:41 WIB; see `PRODUCTION_BACKUP_VALIDATION_2026-09-15.md`. It is a point-in-time snapshot, not approval to deploy. Immediately before any separately approved production deployment, refresh the backup if operational data has changed and reverify source identity, counts, IDs, relations, checksum, and rollback lineage.
