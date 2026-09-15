# Motokraf production backup validation — 2026-09-15

Status: **PASS — CURRENT READ-ONLY BACKUP CREATED; NO DEPLOYMENT PERFORMED**

## Source identity (verified at backup time)

- Source is the native Google spreadsheet `MVP Data Store - v1` located in the established production data folder alongside the previous production backup.
- Spreadsheet timezone: Asia/Jakarta; locale: en_US.
- Source tabs: Jobs, Payments, Expenses, Media. Backup copy retains all four tabs and matching tab IDs/structure.
- Source and backup have distinct Drive file IDs. Source values were read only; no source cell, schema, permission, or record was edited.

## Backup artifacts

- Timestamp: 2026-09-15 22:41 WIB.
- Drive-native full copy: [BACKUP_PRODUCTION_MVP_DATA_STORE_20260915_2241_WIB](https://docs.google.com/spreadsheets/d/12Y6I2I-rDMS-vQpPwYAPWGUW47KLYyLjpl4mT1YIztw/edit?usp=drivesdk)
- Local XLSX: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\backups\BACKUP_PRODUCTION_MVP_DATA_STORE_20260915_2241_WIB.xlsx`.
- Drive XLSX export copy: [download/open](https://docs.google.com/spreadsheets/d/1ZgHPkTnu7oQuAY8H3U37PjmbqA3hLnG9/edit?usp=drivesdk).
- Local file size: 15,831 bytes.
- SHA-256: `49E4DEE7DBD3C144527EDC6D4BE639DCA842472DF99FB69DF9529A05B5587813`.
- Export opened and read back with a spreadsheet reader.

## Read-back and integrity checks

| Tab | Header fields | Data rows | Unique entity IDs | Duplicate IDs |
|---|---:|---:|---:|---:|
| Jobs | 13 | 39 | 39 | 0 |
| Payments | 10 | 39 | 39 | 0 |
| Expenses | 15 | 26 | 26 | 0 |
| Media | 15 | 0 | 0 | 0 |

- All values across all four tabs in the Drive-native copy matched the source at read time.
- Payment-to-Job references: 39 checked; orphan references: 0.
- Media rows: 0; orphan media references: 0.
- Local XLSX headers and row counts match the native copy.
- These are counts and integrity aggregates only; this report does not expose operational row values or individual record IDs.

## Limits and release handling

- The copy is a point-in-time snapshot. Writes after 2026-09-15 22:41 WIB are not included.
- This backup does not authorize production deployment. No production deployment or write was performed.
- Before a separately approved production rollout, repeat the backup if production data changed, verify the exact production resource identity again, and preserve the prior READY deployment/rollback mapping.
- Use the backup for comparison only. Restoring operational data requires a separate explicit approval and recovery plan.
