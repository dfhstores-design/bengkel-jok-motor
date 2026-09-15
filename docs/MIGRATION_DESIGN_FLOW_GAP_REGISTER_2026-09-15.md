# Motokraf migration gap register — 2026-09-15

Status: **STAGING CANDIDATE DEPLOYED — NOT READY FOR PRODUCTION APPROVAL**

This register refreshes the 2026-09-15 checkpoint against the current checkout and reachable services. Historical test and deployment evidence is identified separately from evidence refreshed in this session. No production resource or operational data was changed.

## Current candidate

| Item | Evidence refreshed now |
|---|---|
| Repository | `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\repo-checkout` |
| Branch | `codex/operator-idle-timeout-2026-09-15` |
| Candidate commit | `8f0c529` — safe retry for idempotent mutation POST; includes payment-date period alignment, repaired monthly PDF/Excel export, and earlier auth candidate commits |
| Staging Vercel preview | `https://aplikasi-bengkel-staging-20260912-iadi01rsv-dfhstores-projects.vercel.app` (`dpl_H9hwFwN5CgxkV4WxorhV1gmTq2rk`, READY, Preview) |
| Staging Apps Script | Version 28 — `Payment-date report periods staging 2026-09-15`; the preview `APPS_SCRIPT_API_URL` was replaced only in the Preview environment to point to this deployment |
| Scoped files in current candidate | `apps-script/Auth.gs`; auth login/user routes; `frontend/app/page.tsx`; `frontend/app/globals.css`; auth contract/tests/gap documentation |
| Local validation | 13/13 Node tests passed, including QPDF structural validation, Excel content assertions, period-alignment cases, and idempotent POST retry behavior; Vercel completed the Next.js build (19 routes); Apps Script auth source syntax check passed; `git diff --check` passed before each scoped commit |
| Preserved worktree changes | `.gitignore`, `frontend/.gitignore`, checkpoint and three mobile screenshots remain outside this commit |
| Drive checkpoint | Fetched checkpoint matches the local 2026-09-15 checkpoint content. The Drive folder listing confirms the checkpoint is present. |

## Refreshed observations

- The expected `repo-checkout` exists under `D:\Documents\AI-GPT`; the initial desktop folder is a separate empty Git repository on `master` with no commits. No work was performed in that folder.
- The staging Vercel project binding identifies `aplikasi-bengkel-staging-20260912` (`prj_P10Kd25TvSOv9OIFBOPVYRwx0zRo`). A new Preview deployment was created with the linked Vercel CLI; the Preview-only backend URL was replaced by the new staging Apps Script version 27 URL. No production environment variable was listed or changed.
- The checkpoint staging alias still identifies itself as Sprint 5. The candidate review URL above is the only URL that proves the current staging deployment; HTTP 200 alone remains insufficient evidence.
- The staging Apps Script project ID and version 27 deployment were verified through its isolated `clasp` configuration. Production Apps Script/Sheet/Drive identity, permissions, and resource mapping remain unverified in this session.
- The latest production backup, checksum/read-back, row/ID/relationship baseline, and rollback lineage remain **historical evidence only** from 2026-09-11/12. They are not a current pre-migration backup.
- Fresh candidate evidence: the current preview reaches the login screen with the approved dropdown/keypad flow; the active-user lookup returned HTTP 200 in 3.35 seconds after deployment. The earlier three-sample preview read measurement was 2.72–3.03 seconds. These read-only samples do not prove POST reliability. The PDF generator repair is covered by QPDF structural validation and the generated PDF/Excel both assert the required monthly values.

## Product Foundation check

Product Foundation documents 00–10 and 09A were reviewed from the local DOCX source. The candidate change is limited to the already specified role-specific session timeout; it does not change the business flow, four operational data tabs, API data contract, Payment cash-in source of truth, ID strategy, or existing records. Apps Script remains the only Sheets/Drive boundary. The release still requires the Sprint 0/feature Definition of Done: end-to-end backend behavior, important failure paths, data integrity, and mobile use must be proven on the isolated staging candidate before deployment approval.

## Gap register

| Severity | Gap and evidence | Action needed | Status |
|---|---|---|---|
| Critical | Candidate deployment/backend pairing. | Current preview is READY and Preview-only `APPS_SCRIPT_API_URL` points to Apps Script version 27. Preserve this URL as the QA target; do not promote it. | CLOSED FOR STAGING |
| Critical | Operator two-hour expiry. | Apps Script version 27 contains role-specific session expiry. Local boundary tests pass; controlled two-hour expiry has not been waited out in staging. | SKIP — APPROVED BY USER |
| Critical | Current production Apps Script deployment/version, Sheet identity, media Drive mapping, and permissions remain unverified. The Vercel production alias/deployment is now refreshed read-only. No write probe was made. | Complete authenticated read-only Apps Script identity and access review through approved tooling. | OPEN |
| Critical | Current timestamped production backup/export is unavailable. The 2026-09-11 backup was read back and its historical integrity comparison refreshed, but live data has since gained 8 Jobs/Payments and 9 Expenses. | Immediately before any approved production migration, create a new timestamped backup under the runbook; verify readability, expected tabs, hashes, unique IDs, counts, and relations. | OPEN — PRODUCTION GATE |
| High | Owner/Operator login/logout/session refresh and response secrecy. | Browser login via active-user dropdown and keypad passed for both roles; logout returned to login state. Login JSON did not expose PIN or session token; cookies carry 6h Owner / 2h Operator. Server execution smoke tooling returned `NOT_FOUND`, controlled expiry and PIN-change role denial remain unproven. | PARTIAL |
| High | Job/Payment/Close Job/media/Expense/history edit/audit and duplicate-submit checks are not tied to the candidate commit. | Repeat the complete Owner/Operator staging interaction matrix and verify immutable IDs/status/payment/relations and audit trail. | OPEN |
| High | All period filters, chart-per-day values, tables/cards/reports consistency, and 390×844 layout are not freshly validated on this candidate. | Payment-date period alignment and `Semua data` coverage now have local regression tests. Repeat all authenticated candidate-preview checks, capture fresh screenshots/download checks, and verify no horizontal overflow. | OPEN |
| High | PDF laporan bulanan tidak dapat dibuka. | Replaced the character-count PDF generator with a byte-accurate, multi-page PDF generator. PDF and Excel now include Pendapatan (Payment), Pengeluaran, Selisih hasil usaha, and Summary Bulanan. QPDF validates the generated PDF structure; user approved both files. | CLOSED |
| High | Latency and recovery after transient failures. | Login observed both a successful UI retry and failed direct/route attempts (about 4–47 seconds). Read-only user lookup later measured 2.72–3.35 seconds with HTTP 200. Idempotent mutation POST now retries once on transient server failure; non-idempotent POST remains single-attempt. Controlled staging recovery evidence is still required. | OPEN / BLOCKER FOR RELEASE |
| Medium | Draft PR #1 remains open/draft at checkpoint commit `74c0788`; it is not this candidate. | Prepare a review branch/PR update only after staging validation and bind all evidence to the exact candidate commit. | OPEN |
| Medium | Existing uncommitted `.gitignore` changes and three untracked screenshots were retained and excluded from the scoped candidate commit. | Review or keep separate later; do not silently discard or mix them with product changes. | PRESERVED |

## Migration decision

The candidate is now reviewable on a verified isolated staging pair. Staging and the operational flow were approved by the user; controlled expiry testing was explicitly skipped. It is **not ready for production deployment approval** because server-side role/PIN tests, the full period/export/mobile matrix on the deployed preview, reliable POST latency, and the current production identity/backup/rollback gates remain incomplete. Production deployment remains unauthorized and was not attempted.

## Production safety

No production deployment, Apps Script, Sheet, Drive media, schema, operational record, or production URL configuration was changed in this session. No production write or cleanup endpoint was called. No staging test data was added or removed in this session.
