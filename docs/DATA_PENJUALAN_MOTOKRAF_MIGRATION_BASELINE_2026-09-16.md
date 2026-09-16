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
| New Apps Script project | PASS — a distinct standalone Apps Script project was created and received the five v29 source files. It is not yet deployed as a public web endpoint and has no configured data-store or media-folder properties. |
| Legacy application and Sheet | UNCHANGED — no route, deployment, Sheet cell, schema, or Apps Script source in the legacy system was changed. |

The local baseline workbook-integrity SHA-256 is
`ddda8103d60fed17857a1d4674b71018730fe742c69c31eabfb81d2d547ef288`.

## Explicitly deferred changes

The approved `AuthUsers` and `AuditLog` tabs have not yet been added. They
will be created only in the new Sheet, after the new backend has its final
configuration and its initial Owner account setup is agreed.

No synthetic records were created. No legacy operational data was edited,
deleted, moved, or redirected.

## Remaining release gates

1. Create a separate media-folder hierarchy and configure the new Apps Script
   project exclusively with the new Sheet and new folders.
2. Establish the initial Owner account without recording a plaintext PIN in
   source code, reports, logs, or this repository.
3. Create and verify `AuthUsers` and `AuditLog` only in the new Sheet.
4. Deploy and validate an isolated candidate frontend that points only to the
   new backend, then run the approved end-to-end tests with real tenant data.
5. Confirm the Sheet sharing policy before release. It is currently readable
   through its link, so restricting access to the intended administrators is a
   separate, user-controlled permission decision.
6. Choose the post-validation public address: a Motokraf subdomain or a Vercel
   address. The legacy URL remains available in either case.

## Rollback position

The new application has no public endpoint or traffic. Rollback at this stage
is simply to leave it unused; the legacy system remains the active system.
