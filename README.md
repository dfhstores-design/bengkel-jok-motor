# Aplikasi Operasional Bengkel Jok — Sprint 0

Implementasi ini hanya mencakup Sprint 0 (Setup Fondasi). Tidak ada Job business flow, Payment flow, Expense UI, media UI, dashboard, laporan, atau permission system kompleks.

## Structure
- `frontend/` — Next.js App Router health-check surface.
- `apps-script/` — Apps Script API foundation, config, storage helpers, locking ID generator, audit/logging foundation, and health check.
- `tests/` — local contract/unit tests for ID generation and response envelope.

## Source of Truth Constraints Applied
- Next.js never accesses Sheets/Drive directly.
- Apps Script is the single API/storage boundary.
- Timezone: Asia/Jakarta.
- IDs: JOB/PAY/EXP/MED-YYYYMMDD-NNNN, backend-generated with script locking.
- Roles are constants OWNER/OPERATOR only; no permission engine yet.
- Audit foundation: created_at, created_by, updated_at, updated_by.
- Only `healthCheck` is routed in Sprint 0.
