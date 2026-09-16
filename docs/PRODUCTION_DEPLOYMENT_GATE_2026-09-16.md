# Production deployment gate — 2026-09-16

## Decision

**HOLD — do not deploy yet.** The user approved a production rollout, but the final read-only gate found two concrete compatibility and backup blockers. No production deployment, Apps Script update, Sheet edit, schema edit, media write, or operational-data write occurred.

## Verified now

| Check | Result |
|---|---|
| Production Vercel alias | Reachable, HTTP 200; current deployment is Ready and retained as the rollback target. |
| Current production frontend compatibility | The current production app returned 404 for `/api/auth/users` and `/api/auth/session`. It is the legacy Sprint 0 frontend, not the v29 authenticated contract. |
| Current production operational reads | Legacy production read routes for dashboard, active Jobs, closed-history Jobs, recap, and expenses responded successfully. These were read-only requests against tenant data. |
| Production Apps Script source | Read-only source inspection found the legacy project with two source files and no v29 server-side authentication implementation. |
| Candidate dependency | The approved candidate uses the v29 backend contract, including server-side sessions and `AuthUsers` / `AuditLog` tabs. |
| Sheet content access | The currently available automation identity can identify the production script and file metadata, but Google Sheets API reads and Drive XLSX export of the tenant Sheet returned HTTP 403. Apps Script Execution API/function runs are also not permitted for this identity. Therefore all rows, columns, and values have **not** been freshly verified. |

## Why rollout is unsafe now

Deploying only the new frontend would point it at a legacy backend that does not provide the required authentication routes. Deploying the v29 Apps Script source also requires a deliberate production schema and authorization migration: the current Sheet must contain valid `AuthUsers` and `AuditLog` tabs with approved headers and hashed user/PIN records. This is a schema/data decision, so it is outside the previously authorized no-schema-change boundary.

## Required gates before rollout

1. Grant or use an approved production identity that can read the actual tenant Sheet content and create a Drive-native backup plus XLSX export. The preflight must enumerate every tab, header, row, column, unique ID, and Job/Payment/Expense/Media relation, then read the backup back and compare it.
2. Explicitly authorize the production authentication schema migration: add the `AuthUsers` and `AuditLog` tabs only, with the approved headers; provision only approved users with PIN hashes; do not alter the existing four operational tabs or their existing values.
3. Clone the legacy production Apps Script source/version as rollback evidence, deploy the v29 source as a new production version, verify its resource properties point to the existing tenant Sheet and media folders, and retain the old deployment.
4. Deploy the frontend as a new Vercel production deployment only after the new Apps Script version passes read-only login/session and operational smoke checks.

## Rollback prepared

The current Vercel production deployment remains Ready and unchanged. If a later rollout fails, rollback means repointing the production alias to that retained deployment, then returning the Apps Script Web App to its preserved prior version. No data restoration is needed unless an independently verified write failure occurs; the pre-deploy backup is retained for recovery only.
