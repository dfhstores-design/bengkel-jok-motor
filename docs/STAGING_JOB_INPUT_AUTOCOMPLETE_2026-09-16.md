# Staging job-input autocomplete — 2026-09-16

## Change

The New Job form again offers autocomplete for Model motor, Jenis pekerjaan, Nama pelanggan, and WhatsApp. Suggestions are stored separately for each authenticated user in that browser's local storage.

A value enters the suggestion history only after the backend has accepted the new Job. The list is limited to the 12 newest unique values per field. It is a convenience feature, not an operational source of truth: the submitted Job continues through the existing authenticated, idempotent backend path.

This design does not request closed-job history or expose historical customer data to an Operator. It keeps the server-side role boundary intact.

## Candidate and evidence

| Item | Status |
|---|---|
| Frontend commit | `daa0332 Restore job input autocomplete history` |
| Vercel preview | `https://aplikasi-bengkel-staging-20260912-2k415dpb2-dfhstores-projects.vercel.app` |
| Deployment | `dpl_psp1ieygPFMWtvZXMRQSmmCJPyJn`, target `preview`, Ready |
| Existing automated tests | PASS — 14 passed, 0 failed |
| Frontend build | PASS — existing Autoprefixer compatibility warnings remain unchanged |
| Browser flow | PASS — mocked authenticated Operator saved a Job, reloaded the page, reopened New Job, and found the saved Model in the datalist; stored Jenis pekerjaan and customer value were also checked. |
| Mobile evidence | PASS — 390×844 screenshot: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\qa-evidence\staging-v29-job-input-autocomplete-mock-390x844-20260916.png`; SHA-256 `2757289B6C778AFA550992329AA3B213A57C052F2CF1C5B69CC4ED3D41AC4FA0`. |
| Preview source and auth bridge | PASS — preview returned HTTP 200, its page bundle contains the local autocomplete key, and authenticated user-list read returned two users. |

## Data and release boundary

The browser test intercepted all APIs, so it did not create, modify, or delete staging or production data. The frontend change does not modify Apps Script, Sheet schema, media, deployment version, Owner dashboard, or Operator dashboard. Production was not deployed.
