# Motokraf migration gap register — 2026-09-15

Status: **PREPARATION IN PROGRESS — NOT READY FOR PRODUCTION APPROVAL**

This register refreshes the 2026-09-15 checkpoint against the current checkout and reachable services. Historical test and deployment evidence is identified separately from evidence refreshed in this session. No production resource or operational data was changed.

## Current candidate

| Item | Evidence refreshed now |
|---|---|
| Repository | `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\repo-checkout` |
| Branch | `codex/operator-idle-timeout-2026-09-15` |
| Candidate commit | `9a752f949f280b4954c5a51aeac738bef210cd67` — `Enforce role-specific session expiry` |
| Scoped files in commit | `apps-script/Auth.gs`, `docs/AUTHORIZATION_CONTRACT_2026-09-12.md`, `tests/auth-session.test.mjs` |
| Local validation | 7/7 Node tests passed; Next.js build completed (19 routes); Apps Script auth source syntax check passed; `git diff --check` passed before commit |
| Preserved worktree changes | `.gitignore`, `frontend/.gitignore`, checkpoint and three mobile screenshots remain outside this commit |
| Drive checkpoint | Fetched checkpoint matches the local 2026-09-15 checkpoint content. The Drive folder listing confirms the checkpoint is present. |

## Refreshed observations

- The expected `repo-checkout` exists under `D:\Documents\AI-GPT`; the initial desktop folder is a separate empty Git repository on `master` with no commits. No work was performed in that folder.
- The staging Vercel project binding in the checkout identifies `aplikasi-bengkel-staging-20260912` (`prj_P10Kd25TvSOv9OIFBOPVYRwx0zRo`). The Vercel connector project list returned no projects; a direct deployment listing returned **403 Forbidden**. Deployment commit and environment lineage could not be read from that connector.
- GET requests to the two checkpoint staging URLs and the production alias returned HTTP 200, but all three page titles identify **Aplikasi Bengkel — Sprint 5**. HTTP 200 is not evidence that this candidate is deployed or that its backend binding is correct.
- The current staging Apps Script version, its deployed source checksum, staging Sheet/Drive identities, production Apps Script URL/version, production Sheet/media identities, current permissions, and current resource mappings were **not independently verified in this session**.
- The latest production backup, checksum/read-back, row/ID/relationship baseline, and rollback lineage remain **historical evidence only** from 2026-09-11/12. They are not a current pre-migration backup.
- Staging interaction evidence for authentication, user/PIN administration, operational flows, exports, chart filters, mobile layout, and latency is historical. It must be rerun against a preview/backend pair proven to use this candidate.

## Gap register

| Severity | Gap and evidence | Action needed | Status |
|---|---|---|---|
| Critical | Candidate is not deployed to staging. Live preview URLs still show Sprint 5; Vercel deployment listing is blocked with 403. | Restore authorized staging deployment inspection/deploy access; verify preview source commit and `APPS_SCRIPT_API_URL` points only to the isolated staging deployment before publishing a preview. | BLOCKED |
| Critical | Operator two-hour expiry is committed and unit-tested locally, but staging Apps Script version/source is not refreshed or verified. No `clasp` executable was found in the available shell. | Provide an authorized Apps Script staging deployment path; publish a new staging version only after confirming staging project and datastore identity. Verify deployed source checksum/version. | BLOCKED |
| Critical | Current production endpoint, Apps Script deployment/version, Sheet ID, media Drive mapping, and permissions are unverified. No write probe was made. | Complete authenticated read-only identity and access review through approved tooling. | OPEN |
| Critical | Current timestamped production backup/export, read-back integrity, and current rollback mapping are unavailable. The 2026-09-11/12 backup is historical. | After staging acceptance and before any production migration, create a timestamped backup under the approved production procedure; verify file readability, expected tabs, hashes, unique IDs, counts, and relations. | OPEN — PRODUCTION GATE |
| High | End-to-end Owner/Operator expiry, login/logout/session refresh, role denial, PIN change, and no-plaintext response/log checks have not been repeated against this commit. | Run on isolated staging with synthetic accounts only; retain existing 350 synthetic records and report their current markers/counts/relations without deleting them. | OPEN |
| High | Job/Payment/Close Job/media/Expense/history edit/audit and duplicate-submit checks are not tied to the candidate commit. | Repeat the complete Owner/Operator staging interaction matrix and verify immutable IDs/status/payment/relations and audit trail. | OPEN |
| High | All period filters, chart-per-day values, tables/cards/reports consistency, PDF/Excel download content, and 390×844 layout are not freshly validated on this candidate. | Repeat on the authenticated candidate preview, capture fresh screenshots/download checks, and verify no horizontal overflow. | OPEN |
| High | Latency and recovery after transient failures have no refreshed measurements. | Collect repeated login, dashboard/report, job/history read, and transient recovery timings; report median/range and failures without masking cold starts. | OPEN |
| Medium | Draft PR #1 remains open/draft at checkpoint commit `74c0788`; it is not this candidate. | Prepare a review branch/PR update only after staging validation and bind all evidence to the exact candidate commit. | OPEN |
| Medium | Existing uncommitted `.gitignore` changes and three untracked screenshots were retained and excluded from the scoped candidate commit. | Review or keep separate later; do not silently discard or mix them with product changes. | PRESERVED |

## Migration decision

The local role-specific timeout change is reviewable and locally validated. The overall migration is **not ready for deployment approval** because the candidate cannot yet be tied to a verified staging deployment/backend, the full staging acceptance matrix is stale, and the production identity/backup/rollback evidence must be refreshed. Production deployment remains unauthorized and was not attempted.

## Production safety

No production deployment, Apps Script, Sheet, Drive media, schema, operational record, or production URL configuration was changed in this session. No production write or cleanup endpoint was called. No staging test data was added or removed in this session.
