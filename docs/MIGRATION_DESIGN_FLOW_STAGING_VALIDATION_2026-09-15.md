# Motokraf staging validation — 2026-09-15

Status: **PARTIAL PASS — NOT READY FOR PRODUCTION APPROVAL**

This report records the candidate actually deployed to the isolated staging preview. It does not claim production validation. No production resource or operational data was changed.

## Candidate lineage

| Item | Verified now |
|---|---|
| Git branch and commit | `codex/operator-idle-timeout-2026-09-15` at `8f0c529` (`Retry idempotent staging mutations`) |
| Vercel preview | `https://aplikasi-bengkel-staging-20260912-iadi01rsv-dfhstores-projects.vercel.app` |
| Vercel deployment | `dpl_H9hwFwN5CgxkV4WxorhV1gmTq2rk`, Preview, READY |
| Staging Apps Script | Version 28, `Payment-date report periods staging 2026-09-15` |
| Backend pairing | Preview-only backend configuration was set to the version-27 staging deployment. Production configuration was not changed. |
| Scope | Login/auth resilience only. Owner and Operator dashboard files were not changed. |

## Evidence and results

| Check | Result | Evidence |
|---|---|---|
| Node auth/session tests | PASS | 7 of 7 passed: role limits, invalid role, IDs, response envelope. |
| Apps Script auth syntax | PASS | Staging Auth source parsed successfully before deployment. |
| Next.js production build | PASS | 19 routes generated successfully for commit `92b0256`. |
| Preview deployment | PASS | `dpl_2oMcYtnLfv2fVMR6oqBCnDnpwYXg` is READY. |
| Login selection UI | PASS | Current preview rendered the approved active-user dropdown, Owner/Operator choices, and PIN keypad. |
| Owner/Operator browser login and logout | PASS, earlier same-session candidate evidence | Both roles reached their unchanged dashboard and returned to login after logout. No operational record was written. |
| Job detail media slots | PASS, earlier same-session candidate evidence | Operator opened an existing staging job detail and its Before/Process/After slots without editing data. |
| Login response secrecy | PASS, earlier same-session candidate evidence | The route returns no session token in JSON and uses an HttpOnly cookie. PIN is not returned. |
| Cookie expiry | PASS, earlier same-session candidate evidence | Owner cookie is 6 hours; Operator cookie is 2 hours. |
| Login user lookup latency | PASS WITH LIMITATION | Three warm preview reads: 2.72 s, 2.86 s, 3.03 s; fresh candidate read: 3.35 s, all HTTP 200. The route now retries one failed GET after 600 ms. |
| Mobile login layout | PASS, prior candidate UI-equivalent evidence | 390×844 screenshot showed no horizontal overflow. The final retry-only commit does not change layout. |
| Monthly PDF export | PASS LOCAL / PREVIEW READY | A byte-accurate, multi-page PDF generator replaced the rejected legacy file. QPDF checked the generated PDF successfully. |
| Monthly Excel export | PASS LOCAL / PREVIEW READY | Summary Bulanan and the detailed Job CLOSED table contain the same financial values as the PDF. |
| Payment-date period consistency | PASS LOCAL / PREVIEW READY | Report total, report history, and closed-job filtering use the linked Payment date; `Semua data` spans from 1900-01-01. |
| Idempotent POST recovery | PASS LOCAL / PREVIEW READY | A transient server failure retries once for an idempotency-keyed mutation. Non-idempotent POST remains single-attempt. |

## Known failures and unexercised checks

- Apps Script POST requests and an Apps Script execution smoke command exhibited intermittent failures. Earlier attempts ranged from about 4 to 47 seconds before failure or client retry. This remains a release blocker until repeated measurements and recovery behavior are understood.
- Controlled idle expiry at two hours (Operator) and six hours (Owner) was not waited out in staging. Local boundary tests pass; this is **SKIP — APPROVED BY USER**.
- Server-side role-denial and PIN-change authorization were not proven end-to-end because the safe denial probe encountered the transient relay failure. No PIN was changed.
- New Job visibility, duplicate-submit protection, Payment, Close Job, media write, Expense, owner history edit/audit, filters, daily chart data, reports, PDF/Excel downloads, and dashboard mobile layout have not been freshly exercised against this exact candidate.
- Production identity, permissions, resource mapping, latest backup/read-back checksum, integrity baseline, and rollback validation are still required pre-production gates.

## Safety record

No production deploy, Apps Script, Sheet, Drive media, schema, or operational record was changed. No production write or cleanup request was made. No staging synthetic data was added, removed, or modified during this validation.

## Review decision

The authentication candidate is suitable for technical review. It is **not** suitable for production deployment approval. The transient POST/backend reliability issue and the unexercised operational, integrity, export, mobile-dashboard, and production backup gates must be closed first.

## Addendum — approved staging scope and monthly export repair

The user approved the staging candidate and operational-flow work. The exported monthly report now has a `SUMMARY BULANAN` section containing Pendapatan (from Payment), Pengeluaran, and Selisih hasil usaha (Pendapatan minus Pengeluaran), followed by Job CLOSED detail. The same summary is present in the Excel download. This repair changes export generation only; it does not change either dashboard or backend data.
