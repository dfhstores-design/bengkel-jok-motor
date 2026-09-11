# Migration Design & Flow Live Validation — 2026-09-11

Status: **BLOCKED — NOT DONE**

Scope: Initial read-only audit for migrating the latest Basil UI / Motokraf design and Operator/Owner flows to live production. No production mutation, deployment, schema change, or operational-data write was performed.

## Production baseline

- Production URL: `https://aplikasi-bengkel-sprint0.vercel.app`
- Live HTTP check: **PASS**, HTTP 200; page title identifies the deployed surface as **Aplikasi Bengkel — Sprint 5**.
- Live design migration: **NOT EXERCISED**; the live surface is not yet the latest Basil/Motokraf implementation.
- Apps Script deployment/version: **NOT VERIFIED in this audit**. The repository contains historical setup references, but no current read-only deployment/version evidence was established.
- Sheet ID / Drive folder: **NOT EXPOSED**. Historical configuration exists locally, but current production identity and access were not revalidated.

## Repository and rollback audit

- Repository root: `D:\Documents\ChatGPT\Aplikasi Bengkel Jok Motor`
- Active branch: `master`
- Git status: untracked source, reports, demos, screenshots, archives, and QA folders.
- HEAD/commit: **NONE**; `master` has no commits.
- Origin remote: **NONE**.
- Rollback baseline: **BLOCKED**. A deployment/version rollback cannot be tied to a versioned repository baseline until a clean, approved baseline is established.
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
| Existing data unchanged | NOT PROVEN | No pre/post production backup or checksum evidence |
| No duplicate IDs | NOT PROVEN | No current production export/read-only dataset available |
| Dashboard/report consistency | NOT PROVEN | Current live-to-source reconciliation not completed |
| PDF and Excel download | NOT EXERCISED | Demo-only implementation observed |
| Motokraf logo correct | PARTIAL | Local visual asset inspected; live asset not verified |
| 390×844 no horizontal overflow | NOT PROVEN | Local screenshot inspected; live rendered check pending |
| Production version/commit identifiable | FAIL | Live title identifies Sprint 5, but workspace has no commit baseline |
| Rollback available | BLOCKED | No repository commit/remote and no current deployment lineage evidence |

## Backup evidence

**NOT CREATED / NOT VERIFIED.** No production backup was attempted because the available repository/configuration did not provide a safe, current, custody-preserving export path, and production write/cleanup behavior is explicitly prohibited by the migration guardrails.

## Unresolved blockers

1. No Git commit or remote baseline for a safe migration branch and rollback.
2. Current production Apps Script deployment/version, Sheet identity, Drive mapping, and active configuration are not independently verified.
3. No verified production backup/export with timestamp, checksum, and read-back evidence.
4. Local dependency installation is incomplete; build/static/render QA cannot yet be treated as current evidence.
5. The latest demo uses synthetic localStorage data and does not establish backend-integrated production behavior.
6. Authentication/authorization and Owner/Operator mode switching require explicit production-scope verification; current source labels mode switching as display-only.

## Data-safety confirmation

During this audit, no operational data was deleted, reset, moved, edited, or supplemented with dummy data. No production deployment, schema/API migration, cleanup endpoint, Apps Script write, Sheet write, Drive write, or Vercel mutation was performed.

## Decision

**Do not deploy. Do not claim migration success.** Resume only after the rollback baseline, current live deployment/resource identity, custody-safe backup/export, and local dependency/build gates are resolved.

