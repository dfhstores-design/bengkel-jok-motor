# Data Penjualan Motokraf — Migration Baseline (2026-09-16)

## Purpose

This checkpoint establishes the independently verified baseline for the new
Motokraf data store. The legacy spreadsheet and its existing application URL
remain unchanged and continue to operate independently.

## Verified now

| Check | Result |
| --- | --- |
| New data-store identity | PASS — a distinct native Google Sheet named `Data Penjualan Motokraf` exists and is not trashed. |
| Portable local baseline | PASS — an XLSX export of the new Sheet was saved under the controlled local backup directory and opened successfully. |
| Workbook structure | PASS — `Jobs`, `Payments`, `Expenses`, and `Media` are present. Their total row/column counts are respectively 40/13, 40/10, 27/15, and 1/15. |
| Legacy-to-new comparison | PASS — tab ordering, headers, and every exported cell matched a fresh read-only export from the legacy Sheet. |
| Identity and link invariants | PASS — tested IDs are unique; Payment-to-Job references are intact. |
| New Apps Script project | PASS — a distinct standalone Apps Script project was created, authorized by its owner, and received the five v29 source files. Its version 4 web deployment is separate from the legacy backend and points only to the new data store. |
| New authentication and audit schema | PASS — the approved `AuthUsers` (7 columns) and `AuditLog` (10 columns) tabs were added to the new Sheet only, each with headers and no data rows. |
| New media configuration | PASS — a separate media root with Jobs, Expenses, and Payments folders was created and stored only in the new backend's Script Properties. |
| New backend pre-provisioning verification | PASS — the anonymous endpoint reached the v4 backend, returned an empty login-user list, and no longer recognized the data-store initializer action. |
| Initial accounts | PASS — `owner` (OWNER) and `operator` (OPERATOR) were provisioned through the one-time local form. PINs were hashed before storage and were not retained in source, reports, logs, or the form after completion. |
| Provisioning audit | PASS — the new `AuditLog` contains one initial-provisioning record. |
| Post-provisioning integrity | PASS — all four operational tab hashes and row/column counts still match the pre-provisioning baseline. |
| Backend release state | PASS — version 6 is the active new-backend deployment; the initial-user route is absent. |
| Legacy application and Sheet | UNCHANGED — no route, deployment, Sheet cell, schema, or Apps Script source in the legacy system was changed. |

The local baseline workbook-integrity SHA-256 is
`ddda8103d60fed17857a1d4674b71018730fe742c69c31eabfb81d2d547ef288`.

No synthetic records were created. No legacy operational data was edited,
deleted, moved, or redirected.

## Remaining release gates

1. Deploy and validate an isolated candidate frontend that points only to the
   new backend, then run the approved end-to-end tests with real tenant data.
2. Confirm the Sheet sharing policy before release. It is currently readable
   through its link, so restricting access to the intended administrators is a
   separate, user-controlled permission decision.
3. Choose the post-validation public address: a Motokraf subdomain or a Vercel
   address. The legacy URL remains available in either case.

## Rollback position

The new backend has an isolated endpoint and no frontend traffic. Rollback at
this stage is to leave the new endpoint unused; the legacy system remains the
active system.
