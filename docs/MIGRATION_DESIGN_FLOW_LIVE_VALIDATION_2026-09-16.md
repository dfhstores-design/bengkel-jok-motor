# Motokraf — Live Validation (2026-09-16)

## Result

**PASS WITH LIMITATIONS** — the isolated new Motokraf system is live at
https://motokraf.vercel.app. The legacy application, legacy Apps Script, and
legacy Sheet were not changed.

## Release identity

| Item | Verified value |
| --- | --- |
| Public URL | https://motokraf.vercel.app |
| Vercel deployment | `dpl_5Rpy6LgrMumYNu1hpkdDZ1y29tam`, READY, Production |
| Frontend source lineage | isolated candidate built from repository branch `codex/operator-idle-timeout-2026-09-15`; latest review record before release `3bdf26f` |
| Backend | isolated Apps Script version 6 only; endpoint intentionally omitted from this report |
| Data source | new `Data Penjualan Motokraf` Sheet only |

## Backup and integrity

- Pre-release backup: `DATA_PENJUALAN_MOTOKRAF_RELEASE_PRE_HIDE_20260916_112312.xlsx`.
- Post-live read-only export: `DATA_PENJUALAN_MOTOKRAF_POST_LIVE_20260916_1130.xlsx`.
- Both exports contain exactly `Jobs`, `AuthUsers`, `AuditLog`, `Payments`,
  `Expenses`, and `Media`.
- The post-live workbook integrity hash is
  `2b106f924c4f8e938a17c6abf7da2b4574bc5802b5d0bc7f320b8e113ec30115`,
  identical to the pre-release export.
- Operational hashes remain identical: Jobs 40/13, Payments 40/10, Expenses
  27/15, and Media 1/15. IDs and existing relations were not changed.
- No synthetic record, cleanup action, deletion, schema replacement, or
  operational data edit was run.

## Access and smoke test

| Check | Result |
| --- | --- |
| Sheet public link access | PASS — no `anyone` permission remains; anonymous export now requires Google authentication. Existing three user permissions remain. |
| Production login screen | PASS — Owner and Operator are listed at `motokraf.vercel.app`. |
| Browser console | PASS — no warning or error observed during production login-page smoke test. |
| Owner/Operator UAT | PASS — previously reported by the account holder on the isolated candidate; PINs were never disclosed or recorded. |
| Existing-data integrity | PASS — post-live export equals the pre-release baseline. |

## Known limitations

- A prebuilt production attempt failed before becoming active because Vercel
  could not locate a generated function artifact. The succeeding standard
  Vercel build is the active deployment.
- Mobile 390x844 and full operational flows were accepted on the candidate but
  not re-exercised after the production alias changed.
- This release did not include a new latency benchmark; historic cold-start
  behavior remains a monitoring item.

## Rollback

The validated Preview artifact remains available as a rollback candidate:
`https://motokraf-jf031x341-dfhstores-projects.vercel.app`.

If rollback is needed, promote that validated Preview artifact back to the
Motokraf production alias, verify its login page read-only, and keep the
current production deployment in Vercel history. The legacy application URL
and its data path remain independent fallback paths. Do not restore or modify
the new Sheet unless an integrity comparison shows a real data issue.
