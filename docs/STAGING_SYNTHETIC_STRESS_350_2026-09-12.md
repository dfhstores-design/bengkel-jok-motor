# Staging Synthetic Stress Data — 350 Transactions

Date seeded: 2026-09-12 16:41 WIB  
Scope: isolated staging only — never production.

## Dataset

- 350 synthetic `CLOSED` Job transactions and 350 linked Payment records.
- Marker: `SYNTHETIC_STRESS_350_20260912`.
- Record note: `STAGING ONLY | SYNTHETIC STRESS 350`.
- July 2026: 115 transactions.
- August 2026: 118 transactions.
- September 2026: 117 transactions.
- Actor distribution: 298 Operator (85.1%) and 52 Owner (14.9%).

## Read-back validation

- Synthetic Job rows returned: 350.
- Every synthetic Job has exactly one matching Payment (`missingPaymentLinks: 0`).
- Duplicate Job/Payment IDs: 0.
- Financial recap inconsistency list: empty.
- The period `2026-07-01` through `2026-09-30` contains 358 CLOSED Jobs: the 350 new rows plus eight prior isolated staging rows.

## UI validation

- Owner Summary custom period `2026-07-01` to `2026-09-30` rendered monthly graph values:
  - July: Rp45.290.000 / 117 Job.
  - August: Rp46.232.000 / 120 Job.
  - September: Rp45.800.000 / 121 Job.
- The extra counts above each monthly seed allocation are pre-existing staging-only CLOSED Jobs.
- Viewport width: 390 px; document width: 390 px; no horizontal overflow.
- Read performance on the staging preview: history 358 rows approximately 3.2 seconds; recap approximately 3.9 seconds.

## Safety

- No production Vercel deployment, Apps Script, Sheet, Drive folder, or operational data was read or changed.
- The temporary preview-only trigger used to run the idempotent seed was removed after completion. The staging Apps Script seed function remains protected by its `staging` environment guard and idempotency marker.
