# Motokraf — Aplikasi Bengkel Jok Motor

Checkpoint repository untuk migrasi design dan flow mobile-first Motokraf ke versi live.

## Status

- Branch checkpoint: `codex/checkpoint-2026-09-11`
- Status: siap untuk audit/migrasi berikutnya; belum deploy production dari branch ini.
- Source of truth data production tetap berada di Apps Script, Google Sheets, dan Google Drive.
- Demo lokal menggunakan data synthetic/localStorage dan tidak boleh diperlakukan sebagai data operasional.

## Demo

Buka `frontend/demo-local-basil.html` melalui server lokal. File wrapper memuat `demo-local-basil-app.html` dan menggunakan `frontend/motokraf-site-ico.webp`.

## Guardrails

1. Jangan mengubah atau menghapus data operasional saat migrasi UI.
2. Jangan mengganti ID, timestamp, status, relasi, atau header Sheets existing.
3. Wajib membuat backup dan rollback baseline sebelum deployment live.
4. Verifikasi Apps Script, Sheets, Drive, dan Vercel secara read-only sebelum perubahan production.
5. Mode Owner/Operator pada demo adalah batas tampilan/UX, bukan secure authentication enterprise.

## Dokumen

- [Migration progress checkpoint](docs/MIGRATION_DESIGN_FLOW_PROGRESS_2026-09-11.md)
- [Prior live validation report](docs/MIGRATION_DESIGN_FLOW_LIVE_VALIDATION_2026-09-11.md)
