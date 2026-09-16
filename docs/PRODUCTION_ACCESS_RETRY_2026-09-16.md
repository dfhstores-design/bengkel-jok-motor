# Production Access Retry — 2026-09-16

## Scope

This checkpoint records a read-only retry to create and validate a production
tenant-data backup before the approved Motokraf production migration. It does
not authorize, perform, or imply any production deployment, schema change, or
operational-data write.

## Fresh evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Repository candidate | VERIFIED | Branch remains at the approved schema-scope checkpoint; pre-existing user worktree changes were left untouched. |
| Target spreadsheet discovery | VERIFIED | The authenticated Drive identity can discover exactly one matching native Google Sheet. |
| Read every tab, row, and column | FAIL — access denied | Google Sheets read request returned HTTP 403. |
| Download a portable XLSX backup | FAIL — access denied | Drive export request returned HTTP 403. No local export was created. |
| Create a timestamped Drive backup copy | FAIL — access denied | Drive copy request returned HTTP 403. No Drive backup copy was created. |
| Existing production data | UNCHANGED | All calls in this retry were metadata/read/export/copy attempts. No Sheet write, schema change, Apps Script deploy, or Vercel production deploy succeeded. |

## Interpretation

The current Google authorization can resolve target-file metadata, but it
cannot read Google Sheets content, export it, or create a backup copy through
the APIs used for the controlled migration. Therefore it cannot establish the
required backup checksum, tab/column inventory, row count, unique-ID checks,
or relationship baseline.

## Release decision

**HOLD.** Do not add `AuthUsers` or `AuditLog`, deploy the v29 candidate, or
move the production alias until a complete, independently readable backup and
integrity baseline exist.

## Required recovery action

Re-authorize the Google connection used for this work with access to the
production tenant spreadsheet that permits Google Sheets content reads and
Drive export/copy. After access is restored, repeat in this order:

1. create a new timestamped backup without overwriting any earlier backup;
2. verify its hash and that it can be read;
3. inventory all tabs, headers, row counts, unique IDs, and relationships;
4. record the baseline and rollback reference; and
5. only then apply the explicitly approved new authentication/audit tabs and
   proceed to the already approved production rollout.

## Data safety statement

No production operational row, column, identifier, timestamp, status,
payment, expense, media record, relation, or existing schema was changed in
this retry.
