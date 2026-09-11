# Migration Design & Flow Live Validation — 2026-09-11

Status: **BLOCKED — NOT DONE**

Scope: Initial read-only audit for migrating the latest Basil UI / Motokraf design and Operator/Owner flows to live production. No production mutation, deployment, schema change, or operational-data write was performed.

## Production baseline

- Production URL: `https://aplikasi-bengkel-sprint0.vercel.app`
- Live HTTP check: **PASS**, HTTP 200; page title identifies the deployed surface as **Aplikasi Bengkel — Sprint 5**.
- Live design migration: **NOT EXERCISED**; the live surface is not yet the latest Basil/Motokraf implementation.
- Apps Script deployment/version: **VERIFIED READ-ONLY** through authenticated `clasp deployments`: version 20, description `Sprint 6 hardening`, plus version 15, description `Sprint 5 dashboard history recap final`; an additional HEAD deployment exists without a release description.
- Sheet ID / Drive folder: **NOT EXPOSED**. Historical configuration exists locally, but current production identity and access were not revalidated.

## Repository and rollback audit

- Repository root: `D:\Documents\ChatGPT\Aplikasi Bengkel Jok Motor`
- Active branch: `master`
- Git status: untracked source, reports, demos, screenshots, archives, and QA folders.
- HEAD/commit: **NONE**; `master` has no commits.
- Origin remote: **NONE**.
- Rollback baseline: **PASS WITH LIMITATION**. GitHub checkpoint branch is versioned at `74c0788b8ed8430a812b05cd3cc57a2cdd4ad6e0`; Vercel active production deployment and prior READY production deployment lineage are identifiable; Apps Script versions 20 and 15 are listed for rollback. Exact live Apps Script URL/resource mapping remains intentionally omitted from the sanitized report.
- Production Vercel deployment: **VERIFIED READY**; active deployment ID `dpl_B7CfXhY12Zzedq2SiGKSc52DXgyn`, production alias `aplikasi-bengkel-sprint0.vercel.app`.
- Local dependencies: **INCOMPLETE**; `frontend\node_modules` is absent and only `node_modules.incomplete-20260911` exists.

## Source and demo comparison

### Current Next.js source

- `frontend/app/page.tsx` contains the current business API wiring for dashboard, recap, jobs, history, payment/close, media, and expenses.
- The visible app remains a dense Sprint 6-style form/dashboard layout.
- Owner edit-history flow, monthly PDF/Excel download, the latest mobile shell, and the latest Operator start/check flow are not present in the main Next.js page.
- The page explicitly describes mode switching as display-only, not secure authentication/authorization; this is not sufficient evidence for production login/mode acceptance.

### Latest local demo

- `frontend/demo-local-basil.html` and `frontend/demo-local-basil-app.html` contain the latest local Basil/Motokraf reference surface.
- Demo evidence includes: Motokraf logo asset, mobile-first shell, Owner monthly report, PDF/Excel download actions, Owner history editing, Operator `Jenis pekerjaan`, `Deskripsi pekerjaan`, `Mulai Kerja`, and Owner `Periksa pekerjaan`.
- Demo data is localStorage-backed synthetic data and is not a production integration proof.
- Latest inspected visual evidence: `frontend/motokraf-revision-final-check.png` at 390×844. It shows the intended Motokraf login visual, but this does not prove the live app or secure authentication.

## Migration plan (pending unblock)

1. Establish and verify a clean versioned baseline and separate migration branch.
2. Reconcile current live Vercel deployment, Apps Script deployment/version, Sheet schema, and Drive media mapping through read-only evidence.
3. Obtain a custody-safe production export/backup with timestamp, size, checksum, and read-back evidence. Do not use health-check/cleanup paths that write to production.
4. Freeze the cross-page design/flow specification from the Basil demo and official Motokraf logo asset.
5. Port the design and flows into the existing Next.js/API boundary without changing existing IDs, timestamps, statuses, relations, or sheet headers.
6. Run local install, syntax/type checks, build, static integrity checks, isolated synthetic tests, and 390×844 rendered validation.
7. Deploy preview/staging only, then perform read-only smoke and synthetic isolated workflow checks.
8. Request explicit production approval only after backup, data-integrity, and rollback evidence are complete.

## Files/components expected to change (not changed)

- `frontend/app/page.tsx`
- `frontend/app/globals.css`
- `frontend/app/layout.tsx` and/or a new shared UI component layer if required by the frozen design spec
- `frontend/public/` or equivalent asset location for the official Motokraf logo, after source verification
- API routes only if required for a non-destructive Owner edit/report contract; existing backend source remains the source of truth
- Tests and validation documentation corresponding to any approved API/UI change

## Acceptance gate

| Criterion | Status | Evidence / limitation |
|---|---|---|
| Production URL identified | PASS | Public Vercel host returned HTTP 200 |
| Latest design visible on live URL | FAIL | Live page is Sprint 5 lineage |
| Operator latest flow | NOT EXERCISED | Present only in local demo evidence |
| Owner latest flow | NOT EXERCISED | Present only in local demo evidence |
| Existing data unchanged | NOT PROVEN | Backup baseline exists; no pre/post migration comparison because migration has not started |
| No duplicate IDs | NOT PROVEN | No current production export/read-only dataset available |
| Dashboard/report consistency | NOT PROVEN | Current live-to-source reconciliation not completed |
| PDF and Excel download | NOT EXERCISED | Demo-only implementation observed |
| Motokraf logo correct | PARTIAL | Local visual asset inspected; live asset not verified |
| 390×844 no horizontal overflow | NOT PROVEN | Local screenshot inspected; live rendered check pending |
| Production version/commit identifiable | PASS WITH LIMITATION | Vercel deployment ID and Apps Script version 20 verified; current Vercel source commit linkage is not exposed by CLI output |
| Rollback available | PASS WITH LIMITATION | Vercel prior READY deployments and Apps Script versions 20/15 available; no rollback executed |

## Backup evidence

**PASS WITH LIMITATION.** A Drive copy was created and read back as `BACKUP_PRODUCTION_MVP_DATA_STORE_2026-09-11_2355`. A local XLSX export is stored at `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\backups\BACKUP_PRODUCTION_MVP_DATA_STORE_2026-09-11_2355.xlsx`.

- Drive copy: four expected tabs visible — `Jobs`, `Payments`, `Expenses`, `Media`.
- Local export: 13,884 bytes.
- Local SHA-256: `444456363297C897A118210F6EDDC01717856C0276EDF4A0B2009E0533BDA587`.
- Limitation: this is backup/export evidence, not yet a pre/post migration integrity comparison because migration has not started.

## Unresolved blockers

1. Preview/staging deployment and isolated backend/Sheet path are not yet established.
2. The latest demo uses synthetic localStorage data and does not establish backend-integrated production behavior.
3. Authentication/authorization and Owner/Operator mode switching require explicit production-scope verification; current source labels mode switching as display-only.

## Data-safety confirmation

During this audit, no operational data was deleted, reset, moved, edited, or supplemented with dummy data. The only Drive write was the explicitly requested backup copy; the production spreadsheet, Apps Script, Sheets tabs, Drive media, and Vercel production deployment were not changed.

## Decision

**Do not deploy. Do not claim migration success.** Backup/export and Vercel rollback evidence are now available. Resume only after current Apps Script version/resource identity, staging separation, and local dependency/build gates are resolved.
