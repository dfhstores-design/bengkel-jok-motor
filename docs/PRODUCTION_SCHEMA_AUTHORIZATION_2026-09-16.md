# Production schema authorization — 2026-09-16

The owner explicitly approved adding the production `AuthUsers` and `AuditLog` tabs required by the v29 authenticated backend.

## Authorized scope

- Add only `AuthUsers` and `AuditLog` with the approved headers.
- Store user PINs only as hashes.
- Do not alter the existing `Jobs`, `Payments`, `Expenses`, or `Media` tabs, their IDs, timestamps, statuses, payments, or relationships.

## Execution gate still active

The schema action is intentionally **not yet executed**. The currently available production automation identity cannot export or read the actual tenant Sheet contents: Google Sheets API and Drive XLSX export returned HTTP 403. A complete read-backable backup must exist first. No synthetic data is permitted or used.

The retained production deployment remains the rollback target. Once full Sheet content access is restored, the next sequence is: capture/validate backup, preserve legacy Apps Script version, add the approved tabs, deploy the new Apps Script version, deploy the Vercel frontend, and perform read-only smoke checks.
