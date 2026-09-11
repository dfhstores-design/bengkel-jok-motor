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

## Backup evidence

- Backup: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\backups\BACKUP_PRODUCTION_MVP_DATA_STORE_2026-09-11_2355.xlsx`
- SHA-256: `444456363297C897A118210F6EDDC01717856C0276EDF4A0B2009E0533BDA587`
- Expected tabs read back: `Jobs`, `Payments`, `Expenses`, `Media`.
- Backup is available for rollback comparison; no production pre/post migration write occurred.

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
| Login and mode switching | NOT EXERCISED | Current implementation documents mode switching as display-only; production authorization must be reviewed separately. |
| Existing operational data readable without change | NOT PROVEN | Production was not queried for a full integrity comparison during this migration. |
| No data loss or duplicate operational IDs | PASS WITH LIMITATION | Isolated synthetic staging workflow passed; production-wide duplicate scan remains pending. |
| Dashboard/report consistency | PASS WITH LIMITATION | Staging synthetic totals reconcile exactly; production comparison remains pending. |
| PDF and Excel download | NOT EXERCISED | UI/source path exists, but preview download acceptance still needs a browser file-download check. |
| Motokraf logo correct | PASS | Official checkpoint asset is present in the frontend. |
| Mobile 390x844 without horizontal overflow | PASS WITH LIMITATION | Approved local 390x844 visual and responsive CSS; preview browser viewport evidence remains pending. |
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

- Production data integrity pre/post comparison is not yet proven.
- Production authentication/authorization and Owner edit-history authorization contract are not yet approved for migration.
- Preview browser validation for PDF/Excel download and exact 390x844 viewport is still pending.
- An isolated Vercel project named `repo-checkout` was accidentally created by an earlier root-level deploy attempt. It has no production alias and was not deleted; cleanup requires explicit owner approval.

## Data-safety confirmation

No operational data was changed or deleted by this validation. The only writes after backup were synthetic records in the isolated staging Sheet and staging Drive context. Production Vercel, Apps Script, Sheets, Drive media, IDs, timestamps, statuses, and relations remain untouched.

## Decision

**Do not deploy production yet.** The staging Apps Script + Vercel preview integration and synthetic Job/Payment/Expense reconciliation pass. Production migration remains gated on production read-only integrity evidence, approved authentication/authorization behavior, and browser-level preview acceptance for downloads and mobile viewport.
