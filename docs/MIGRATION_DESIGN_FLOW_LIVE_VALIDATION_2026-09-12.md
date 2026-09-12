# Migration Design & Flow Live Validation — 2026-09-12

Status: **READY TO DEPLOY — AWAITING REVISION APPROVAL — PRODUCTION NOT DEPLOYED**

## Production URL

- Production URL: `https://aplikasi-bengkel-sprint0.vercel.app/`
- Production deployment was not changed.
- Production operational data, Apps Script, Sheet, Drive media, and live alias were not touched.

## Staging deployment evidence

- Apps Script staging deployment URL: `https://script.google.com/macros/s/AKfycbxZbHhW7c_QaRGcPna5Usj5RCNhztwDDGohJiChsNRcyBJ8oMbCj3ra6C-DN3QJ8ipMHg/exec`
- Access policy: Anyone, execute as owner, based on the supplied deployment evidence.
- Apps Script staging project: `Aplikasi Bengkel Jok - API Staging 2026-09-12`.
- Apps Script staging version: version 21, description `Actor identity staging 2026-09-12`; anonymous access verified from the Vercel runtime.
- Read-only endpoint checks: `listActiveJobs`, `listClosedJobs`, `getDashboard`, and `getRecap` returned successful JSON before synthetic write validation; subsequent synthetic records are documented below.
- Vercel staging project: `aplikasi-bengkel-staging-20260912`.
- Vercel preview deployment: `https://aplikasi-bengkel-staging-20260912-5i2npirh1-dfhstores-projects.vercel.app`
- Vercel deployment ID: `dpl_9xB1FrbnJwvBoDv21oXoPuvx4vuf`.
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
- Authenticated preview browser validation passed at viewport `390x844`: Owner opened a CLOSED synthetic Job detail showing Payment and `Edit Riwayat Owner`; Operator mode showed the operational Job flow and did not show the Owner edit form. Both modes reported document/body scroll width `390` and `horizontalOverflow=false`.
- Browser screenshots: `docs/staging-owner-detail-390x844.png` and `docs/staging-operator-390x844.png`.
- Owner dashboard now includes a lightweight period bar chart `Pemasukan vs Pengeluaran`, computed from the existing recap source; no new backend/schema field or chart library was added. Preview browser verification found the chart text, viewport `390x844`, document scroll width `390`, and `horizontalOverflow=false`. Screenshot: `docs/staging-owner-chart-390x844.png`.
- Login now retries once after a transient network/response failure with a short delay; invalid credentials still fail immediately without retrying.
- UI parity port candidate: the frontend now follows the approved demo structure with Motokraf mobile shell, keypad role login, Owner welcome/insight cards, period chart, bottom navigation, Owner report export controls, Job/Payment/Media detail forms, Expense form, and Owner CLOSED-history edit form. Backend routes and session authorization remain unchanged.
- A staging UI write test created synthetic `JOB-20260912-0003`. Initial UI refresh briefly showed the previous count because the post-write refresh was not awaited; the frontend now awaits the refresh after Job, Expense, and Close Job writes. No repeat submit was made, and readback confirmed exactly one active `JOB-20260912-0003`.
- Staging auth foundation: an `AuthUsers` tab was created additively in the isolated staging Sheet with headers `user_id`, `display_name`, `role`, `pin_hash`, `active`, `created_at`, and `updated_at`. It contains two synthetic users only (`owner-demo` and `operator-demo`), with SHA-256 hashes and no plain PIN values. The staging Apps Script deployment was updated to version 10; no operational tab was changed.

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
- All new operational write functions in the staging source require a valid session and derive `created_by`/`updated_by` from the verified session identity; production remains unchanged.
- No unauthenticated write probe was attempted because it could create or mutate production data.
- Initial result was **BLOCKED — AUTHORIZATION CONTRACT REQUIRED**. The contract is now documented and the required authentication, role, expiry, audit, and server-side authorization checks have been exercised in isolated staging; this does not authorize production enablement.
- Owner-approved personal-use contract is documented in `docs/AUTHORIZATION_CONTRACT_2026-09-12.md`: hashed PINs and roles in `AuthUsers`, login role dropdown, Owner-managed users, six-hour idle expiry for both roles, server-derived actor identity, and restricted Owner history edits with audit evidence.
- Auth backend, frontend session wiring, restricted Owner history edit, and session-derived actor identity are implemented in the isolated staging project and are not enabled in production. The staging-only smoke test passed for login, role denial, invalid PIN rejection, logout invalidation, and PIN non-exposure. Direct operational Apps Script actions now require a valid session; Vercel routes require the HttpOnly session cookie. Owner edit created an `AUDIT-*` row and Operator edit was rejected.

## Files and components changed

- `frontend/app/page.tsx`
- `frontend/app/globals.css`
- `frontend/public/motokraf-site-ico.webp`
- `apps-script/Auth.gs`
- `apps-script/Code.gs`
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
- Actor identity smoke on Apps Script version 21: `JOB-20260912-0002` created and closed by `owner-demo (OWNER)`; linked `PAY-20260912-0002` has the same creator; `EXP-20260912-0002` has the same creator/updater. A separate `EXP-20260912-0003` created by Operator is attributed to `operator-demo (OPERATOR)`.
- These additional records are synthetic staging records and were not deleted after validation.
- Media upload was not exercised because it requires a binary fixture; no media data was created.

## Acceptance criteria

| Criterion | Status | Evidence / limitation |
|---|---|---|
| New design appears at live production URL | NOT EXERCISED | Production deployment intentionally unchanged; preview is the validation target. |
| Owner and Operator latest flows usable | PASS WITH LIMITATION | Protected Vercel preview renders the new flow; Owner history edit and Operator denial are verified in staging, while production auth remains unverified. |
| Login and mode switching | PASS WITH LIMITATION | Preview end-to-end test passed: active users loaded, Owner and Operator login succeeded, Dashboard succeeded after Owner login, logout succeeded, post-logout Dashboard returned 401, and Operator history edit was rejected. Production authorization is not enabled. |
| Existing operational data readable without change | PASS WITH LIMITATION | Read-only live-versus-backup business-content comparison passed; this is a point-in-time baseline, not a post-production-migration comparison. |
| No data loss or duplicate operational IDs | PASS WITH LIMITATION | Jobs, Payments, Expenses, and Media ID sets match backup with zero duplicates; no migration write has occurred yet. |
| Dashboard/report consistency | PASS | Live Dashboard and Recap totals are internally consistent and report zero inconsistencies. |
| PDF download | PASS | User-provided downloaded PDF is readable and visually valid; report values match the demo. |
| Excel download | PASS | User-provided `.xls` file parses successfully, has the expected worksheet and headers, and matches the PDF summary and transaction totals. |
| Motokraf logo correct | PASS | Official checkpoint asset is present in the frontend. |
| Mobile 390x844 without horizontal overflow | PASS | Automated exact viewport check passed on Owner report with no horizontal overflow. |
| Production version/commit identifiable | PASS WITH LIMITATION | Preview deployment `https://aplikasi-bengkel-staging-20260912-c5bnb8n4r-dfhstores-projects.vercel.app` is Ready; staging Apps Script version 21 is identified; production version remains unchanged. |
| Rollback remains possible | PASS | Previous production Vercel deployment and Apps Script versions remain available; no rollback executed. |

## Smoke test

- Preview page: `HTTP 200` when accessed through Vercel deployment tooling.
- Preview `/api/dashboard`, `/api/history`, and `/api/recap`: successful JSON responses through the official deployment protection bypass path.
- GAS staging public endpoint: deployment `AKfycbxZbHhW7c_QaRGcPna5Usj5RCNhztwDDGohJiChsNRcyBJ8oMbCj3ra6C-DN3QJ8ipMHg` returned two synthetic users anonymously from the Vercel runtime.
- Vercel Preview authenticated smoke: `https://aplikasi-bengkel-staging-20260912-ejorggenp-dfhstores-projects.vercel.app`, deployment `dpl_Dkkva1xp7Rmu8AzrpjQKDkjFspjw`, status Ready. `/api/auth/users` returned 2 users; unauthenticated Dashboard returned 401; Owner login and session returned success; Dashboard after login returned success; logout returned success; Dashboard after logout returned 401.
- Owner history edit smoke: Preview deployment `https://aplikasi-bengkel-staging-20260912-c5bnb8n4r-dfhstores-projects.vercel.app`, deployment `dpl_nkz7AAuq8EpoaGHwK77akqUYaqFs`; Owner edit of synthetic `JOB-20260912-0001` returned success with an audit ID, staging `AuditLog` reached 2 rows, and Operator edit returned failure with `AUTH_ROLE_FORBIDDEN`.
- Actor identity smoke: Apps Script version 21 direct POSTs returned `owner-demo (OWNER)` for Job, Payment, and Expense writes; an Operator Expense write returned `operator-demo (OPERATOR)`. No production endpoint was called.
- Authenticated preview matrix: unauthenticated `/api/dashboard` returned `401`; Owner login returned `200`; authenticated `/api/auth/session`, `/api/dashboard`, `/api/history`, `/api/expenses`, `/api/recap`, and `/api/auth/users` returned `200` with successful payloads. Staging readback contained 2 CLOSED history Jobs and 3 synthetic Expenses. Logout returned `200`, followed by `/api/dashboard` returning `401`.
- Authenticated UI smoke: preview login loaded the dynamic user dropdown; Owner mode rendered `Beranda Owner`, dashboard/recap, Job start form, CLOSED history, Expense form, and Owner edit detail; Operator mode rendered `MOTOKRAF · OPERATOR` and the Job start flow while hiding Owner-only history/expense editing areas.
- Updated frontend preview: `https://aplikasi-bengkel-staging-20260912-5i2npirh1-dfhstores-projects.vercel.app`, deployment `dpl_Gk2cA7mXWbz2hNzucKbxyne9czCA`, Ready after restoring the approved Basil CSS bundle and resetting view state across role changes. Fresh visual recheck at 390x844 matched the approved login card and Owner dashboard structure; Owner Dashboard/chart, report/export Blob signatures, Operator role isolation, Job detail Payment/Close/Media controls, and horizontal-overflow checks passed. No production request was made.
- Production smoke test: not run as a mutating test; live production remains unchanged.

## Rollback procedure

1. Keep the current production Vercel alias unchanged.
2. If a future production release is approved and fails, promote the previously identified READY production deployment through Vercel, without changing the Sheet or Apps Script data.
3. Re-point the frontend to the prior approved Apps Script deployment/version only after verifying the exact deployment and access policy.
4. Use the timestamped XLSX/Drive backup for comparison or recovery under an explicit owner-approved recovery procedure; do not overwrite production as an ad-hoc rollback.

## Unresolved risks

- A post-migration comparison cannot exist until a future production deployment is explicitly approved; the current pre-deployment live-versus-backup baseline is complete.
- Production authentication/authorization and Owner edit-history authorization are not deployed; staging implementation is verified with synthetic data only.
- Staging Web App anonymous accessibility is resolved for the new `ANYONE_ANONYMOUS` deployment; the prior Google-account-only candidates remain unused.
- The production endpoint is publicly readable without a verified user session. A server-side authorization design and staging-only test plan are required before any write-capable production release.
- PDF and Excel user-download evidence is complete; the current lightweight preview export implementation still needs a fresh browser download assertion before production consideration.
- No code or production resource was changed while performing the export and mobile checks.
- An isolated Vercel project named `repo-checkout` was accidentally created by an earlier root-level deploy attempt. It has no production alias and was not deleted; cleanup requires explicit owner approval.

## Data-safety confirmation

No operational data was changed or deleted by this validation. The only writes after backup were synthetic records in the isolated staging Sheet and staging Drive context. Production Vercel, Apps Script, Sheets, Drive media, IDs, timestamps, statuses, and relations remain untouched.

## Decision

**Ready to deploy after revision approval.** The production read-only integrity baseline, build, unit tests, mobile viewport check, staging authenticated Owner/Operator smoke, synthetic Owner edit/audit pass, session-derived actor identity checks, current export Blob signature checks, and role-state reset check pass. Production migration is intentionally paused for the user's revision review and explicit release approval; production authorization and data writes remain untouched.
