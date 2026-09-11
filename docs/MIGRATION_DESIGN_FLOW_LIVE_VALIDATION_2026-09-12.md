# Migration Design & Flow Live Validation — 2026-09-12

Status: **STAGING VALIDATED — PRODUCTION NOT DEPLOYED**

## Production URL

- Production URL: `https://aplikasi-bengkel-sprint0.vercel.app/`
- Production deployment was not changed.
- Production operational data, Apps Script, Sheet, Drive media, and live alias were not touched.

## Staging deployment evidence

- Apps Script staging deployment URL: `https://script.google.com/macros/s/AKfycbztGm1dnZt1FF42V0DD2B-T4BEYQ06aATxeUBhcNHhlehl1Pp8eOTATHMVxp-PQ0XHvsw/exec`
- Access policy: Anyone, execute as owner, based on the supplied deployment evidence.
- Apps Script staging project: `Aplikasi Bengkel Jok - API Staging 2026-09-12`.
- Apps Script staging version: version 5, description `Staging synthetic validation 2026-09-12 schema fix`.
- Read-only endpoint checks: `listActiveJobs`, `listClosedJobs`, `getDashboard`, and `getRecap` returned successful JSON against the empty staging datastore.
- Vercel staging project: `aplikasi-bengkel-staging-20260912`.
- Vercel preview deployment: `https://aplikasi-bengkel-staging-20260912-4vgwr9cll-dfhstores-projects.vercel.app`
- Vercel deployment ID: `dpl_BSbtyBT8qusJwNNRpuj9A479NML4`.
- Vercel target/status: `preview / Ready`.
- Preview environment variable: encrypted `APPS_SCRIPT_API_URL`, pointing only to the staging Apps Script URL.
- Local build: `npm run build` passed from `frontend`.

## Browser validation attempt

- The approved local demo opened in Owner mode and displayed `Laporan Bulanan`, `Download PDF`, and `Download Excel`.
- The browser adapter did not observe a download event because both actions create Blob URLs and trigger an in-page anchor click; this is an adapter limitation, so file creation is **NOT PROVEN**.
- A separate headless browser run could not complete reliably in the current local runtime; no production or staging data was involved.
- Existing approved 390x844 visual evidence remains valid for layout review, but a fresh automated exact-viewport run is still pending.
- User-provided PDF evidence `D:\Download\laporan-motokraf-september-2026 (1).pdf` was read and rendered successfully: 1 A4 page, unencrypted, text extraction succeeded, and visual review found no clipping or overlap. Values matched the demo report: income Rp470.000, expense Rp200.000, margin Rp270.000, 2 CLOSED, and 1 active Job.
- User-provided Excel evidence `D:\Download\laporan-motokraf-september-2026.xls` was parsed successfully as SpreadsheetML: worksheet `Laporan`, September 2026, 3 transactions, 2 CLOSED, 1 active Job, Payment total Rp470.000, CLOSED deal total Rp470.000, and duplicate Job ID 0. Summary values match the PDF.
- Exact automated mobile check passed on the approved local demo and Owner report: viewport `390x844`, document scroll width `390`, body scroll width `390`, and `horizontalOverflow=false`.

## Backup evidence

- Backup: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\backups\BACKUP_PRODUCTION_MVP_DATA_STORE_2026-09-11_2355.xlsx`
- SHA-256: `444456363297C897A118210F6EDDC01717856C0276EDF4A0B2009E0533BDA587`
- Expected tabs read back: `Jobs`, `Payments`, `Expenses`, `Media`.
- Backup is available for rollback comparison; no production pre/post migration write occurred.

## Production integrity comparison — read-only

- Audit source: live production routes through `https://aplikasi-bengkel-sprint0.vercel.app` and the timestamped backup above.
- Jobs: 28 backup rows vs 28 live rows; ID set identical; duplicate IDs 0; business-content comparison passed.
- Payments: 28 backup rows vs 28 live rows reconstructed from every Job detail; ID set identical; duplicate IDs 0; business-content comparison passed.
- Expenses: 14 backup rows vs 14 live rows; ID set identical; duplicate IDs 0; business-content comparison passed.
- Media: 0 backup rows vs 0 live linked rows across every Job detail; duplicate IDs 0; business-content comparison passed.
- All 28 history Jobs had readable detail; Payment→Job mismatches 0; Media→Job mismatches 0.
- Dashboard: active jobs 0, income month 3,730,000, expense month 3,055,000, inconsistencies 0.
- Recap for 2026-09-01 through 2026-09-12: income 3,730,000, expense 3,055,000, difference 675,000, CLOSED count 28, inconsistencies 0.
- Numeric formatting differences between XLSX and JSON were normalized semantically; no business-content difference remained.
- Audit runner: `tools/production_integrity_audit_20260912.py`.

## Authentication and authorization gate

- Production Apps Script endpoint accepted a direct unauthenticated read-only `getDashboard` request and returned operational summary data.
- Frontend mode switching is client-side state only. It does not establish identity, session, or role authorization.
- Apps Script source derives `created_by` and `updated_by` from the deployment Script Property `ACTOR_LABEL`, not from a verified request principal.
- No unauthenticated write probe was attempted because it could create or mutate production data.
- Result: **BLOCKED — AUTHORIZATION CONTRACT REQUIRED**. Do not enable production Owner edit-history or promote the new write-capable frontend until authentication, role checks, session expiry, audit identity, and server-side authorization are specified and tested in isolated staging.
- Owner-approved personal-use contract is documented in `docs/AUTHORIZATION_CONTRACT_2026-09-12.md`: hashed PINs and roles in `AuthUsers`, login role dropdown, Owner-managed users, six-hour idle expiry for both roles, server-derived actor identity, and restricted Owner history edits with audit evidence.

## Files and components changed

- `frontend/app/page.tsx`
- `frontend/app/globals.css`
- `frontend/public/motokraf-site-ico.webp`
- Documentation and validation reports.
- No production API route, Apps Script production source, Sheet header, operational row, or Drive media was changed.

## Synthetic staging validation

Synthetic records were created only in the isolated staging Sheet and are clearly labeled `STAGING ONLY`:

- Job `JOB-20260912-0001` created as `IN_PROGRESS`, then closed as `CLOSED`.
- Payment `PAY-20260912-0001` linked to the Job for `125000`.
- Expense `EXP-20260912-0001` created for `15000`.
- Dashboard result: `active_job_count=0`, `income_today=125000`, `income_month=125000`, `expense_month=15000`, `inconsistencies=[]`.
- History result: one CLOSED Job with its linked Payment.
- Recap result: income `125000`, expense `15000`, difference `110000`, CLOSED count `1`, `inconsistencies=[]`.
- No duplicate synthetic Job, Payment, or Expense IDs observed.
- Media upload was not exercised because it requires a binary fixture; no media data was created.

## Acceptance criteria

| Criterion | Status | Evidence / limitation |
|---|---|---|
| New design appears at live production URL | NOT EXERCISED | Production deployment intentionally unchanged; preview is the validation target. |
| Owner and Operator latest flows usable | PASS WITH LIMITATION | Local source and protected Vercel preview render the new flow; secure production auth/mode contract remains unverified. |
| Login and mode switching | BLOCKED — CONTRACT APPROVED | Policy is approved and documented, but secure runtime injection and staging implementation/tests are still required. |
| Existing operational data readable without change | PASS WITH LIMITATION | Read-only live-versus-backup business-content comparison passed; this is a point-in-time baseline, not a post-production-migration comparison. |
| No data loss or duplicate operational IDs | PASS WITH LIMITATION | Jobs, Payments, Expenses, and Media ID sets match backup with zero duplicates; no migration write has occurred yet. |
| Dashboard/report consistency | PASS | Live Dashboard and Recap totals are internally consistent and report zero inconsistencies. |
| PDF download | PASS | User-provided downloaded PDF is readable and visually valid; report values match the demo. |
| Excel download | PASS | User-provided `.xls` file parses successfully, has the expected worksheet and headers, and matches the PDF summary and transaction totals. |
| Motokraf logo correct | PASS | Official checkpoint asset is present in the frontend. |
| Mobile 390x844 without horizontal overflow | PASS | Automated exact viewport check passed on Owner report with no horizontal overflow. |
| Production version/commit identifiable | PASS WITH LIMITATION | Preview deployment ID is identified; production version remains unchanged. |
| Rollback remains possible | PASS | Previous production Vercel deployment and Apps Script versions remain available; no rollback executed. |

## Smoke test

- Preview page: `HTTP 200` when accessed through Vercel deployment tooling.
- Preview `/api/dashboard`, `/api/history`, and `/api/recap`: successful JSON responses through the official deployment protection bypass path.
- GAS staging public endpoint: successful JSON read-only responses for the tested actions.
- Production smoke test: not run as a mutating test; live production remains unchanged.

## Rollback procedure

1. Keep the current production Vercel alias unchanged.
2. If a future production release is approved and fails, promote the previously identified READY production deployment through Vercel, without changing the Sheet or Apps Script data.
3. Re-point the frontend to the prior approved Apps Script deployment/version only after verifying the exact deployment and access policy.
4. Use the timestamped XLSX/Drive backup for comparison or recovery under an explicit owner-approved recovery procedure; do not overwrite production as an ad-hoc rollback.

## Unresolved risks

- A post-migration comparison cannot exist until a future production deployment is explicitly approved; the current pre-deployment live-versus-backup baseline is complete.
- Production authentication/authorization and Owner edit-history authorization contract are not yet approved for migration.
- The production endpoint is publicly readable without a verified user session. A server-side authorization design and staging-only test plan are required before any write-capable production release.
- PDF, Excel, and exact automated 390x844 viewport validation are complete.
- No code or production resource was changed while performing the export and mobile checks.
- An isolated Vercel project named `repo-checkout` was accidentally created by an earlier root-level deploy attempt. It has no production alias and was not deleted; cleanup requires explicit owner approval.

## Data-safety confirmation

No operational data was changed or deleted by this validation. The only writes after backup were synthetic records in the isolated staging Sheet and staging Drive context. Production Vercel, Apps Script, Sheets, Drive media, IDs, timestamps, statuses, and relations remain untouched.

## Decision

**Do not deploy production yet.** The production read-only integrity baseline, PDF/Excel evidence, mobile viewport check, and staging integration pass. Production migration is blocked by the missing server-side authentication/authorization contract; Owner edit-history must remain disabled until that gate is closed.
