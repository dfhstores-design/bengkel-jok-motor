# Staging media-upload confirmation — 2026-09-16

## Scope

Perbaikan ini menambah konfirmasi sukses yang terlihat **di dalam Detail Job** setelah foto atau video bukti pekerjaan untuk tahap Before, Process, atau After selesai diterima. Konfirmasi menyebut tahap dan nama berkas, serta diumumkan dengan `role="status"`. Dashboard Owner dan Operator tidak diubah.

## Candidate

| Item | Evidence | Status |
|---|---|---|
| Frontend commit | `b8cd85c Add visible media upload confirmation` | verified now |
| Vercel preview | `https://aplikasi-bengkel-staging-20260912-indetbkpc-dfhstores-projects.vercel.app` | verified now, HTTP 200 and Ready |
| Vercel deployment | `dpl_J4Tbdh9yGrveXSQtLmb8me1dW2jv`, preview target | verified now |
| Apps Script | staging v29 remains the connected candidate; no Apps Script source or deployment change in this stage | prior evidence, not modified now |
| Production | no deployment, API write, schema, Sheet, Drive media, or operational-data change | verified now for this stage |

## Acceptance evidence

The operator flow now clears an old confirmation when opening/closing a Job or starting a new upload. After the API reports success and the Job detail has refreshed, the newest result is shown directly above the three media slots, for example:

> ✓ Before: before-proof.png berhasil diunggah dan tersimpan.

The status remains visible while the Job detail remains open and long filenames wrap without horizontal overflow.

| Check | Result | Evidence |
|---|---|---|
| Existing automated checks | PASS | `node --test tests\*.test.mjs`: 14 passed, 0 failed |
| Frontend production build | PASS WITH EXISTING WARNING | `npm run build` completed; existing Autoprefixer `end` compatibility warnings remain outside this change |
| Upload success flow without staging write | PASS | Local frontend was run with all API responses intercepted. A simulated Before image upload returned success, refreshed the detail endpoint, and asserted the exact inline confirmation text. |
| Mobile rendering | PASS | 390×844 screenshot inspected; the confirmation is visible above Before/Process/After slots, wraps safely, and does not alter the dashboard. Artifact: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\qa-evidence\staging-v29-media-upload-notice-mock-390x844-20260916.png`; SHA-256 `45484417E50578EA086D082B700DF563228242B64D655FD57CE8A1D9439A9DB6`. |
| Preview source | PASS | Ready preview returned HTTP 200; its page bundle contains `berhasil diunggah dan tersimpan`. |

## User-observed staging v29 validation

The following results were provided by the user for staging v29 and are recorded as user-observed evidence, rather than newly repeated by this stage:

1. Owner/Operator login, logout, session refresh, role denial, and PIN change: **PASS**.
2. Period filters, chart, dashboard, and PDF/Excel during a valid session: **PASS**.
3. Idempotent POST, Job, Payment/Close Job, media, Expense, history edit, and audit: **PASS**. This change resolves the noted visibility gap after a successful media upload.

## Data and release boundary

The local browser validation did not contact staging or production APIs and did not create media, Job, Payment, Expense, or test data. Existing synthetic staging data was neither added, removed, nor edited. Production remains outside this stage; this preview is a review candidate, not a production deployment authorization.

## Remaining review note

The new confirmation was exercised through an isolated mocked API so it can be verified without introducing an additional staging media record. The user-observed v29 media workflow is recorded above. A reviewer may perform one normal staging upload if a fresh live visual observation is desired; it must use the existing isolated staging context and leave the created record intact.
