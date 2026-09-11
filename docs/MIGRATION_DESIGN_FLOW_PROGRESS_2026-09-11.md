# Progress Checkpoint — Migrasi Design & Flow Motokraf

Tanggal: 2026-09-11  
Status: **CHECKPOINT — BELUM DEPLOY KE PRODUCTION**

## Tujuan checkpoint

Menyimpan kondisi kerja terbaru sebelum migrasi design/flow demo Basil-Motokraf ke versi live. Checkpoint ini tidak mengubah data operasional, Google Sheets, Google Drive media, Apps Script, atau deployment production.

## Kondisi saat ini

- Production URL yang pernah diaudit: `https://aplikasi-bengkel-sprint0.vercel.app`
- Status production terakhir: HTTP 200, lineage tampilan masih Sprint 5 dan belum dipastikan memakai design terbaru.
- Demo lokal terbaru: `frontend/demo-local-basil.html` dengan source utama `frontend/demo-local-basil-app.html`.
- Logo yang digunakan demo: `frontend/motokraf-site-ico.webp`.
- Demo bersifat localStorage/synthetic dan bukan bukti integrasi production.
- GitHub repository tujuan: `https://github.com/dfhstores-design/bengkel-jok-motor`
- Kondisi GitHub saat audit: branch `main` hanya berisi `.gitkeep`; belum ada source aplikasi.

## Perubahan UI/flow yang sudah tersedia di demo lokal

- Login mobile-first Owner/Operator dengan logo Motokraf di dalam kartu login.
- Shell Owner bergaya Basil UI dengan dashboard, ringkasan periode, riwayat, pengeluaran, dan laporan bulanan.
- Chart penjualan stacked bar dengan label Rupiah vertikal dan jumlah job.
- Export laporan demo ke PDF dan Excel-compatible `.xls`.
- Riwayat dapat diedit dari sisi Owner pada demo.
- Flow Operator disederhanakan: `Jenis pekerjaan`, `Deskripsi pekerjaan`, tombol `Mulai Kerja`, dan akses `Detail kerja`.
- Wording Owner aktif: `Periksa pekerjaan`.
- Ikon pengeluaran/belanja menggunakan simbol keranjang pada area Owner.

## Artefak utama dan checksum lokal

| Artefak | Ukuran | SHA-256 |
|---|---:|---|
| `frontend/demo-local-basil.html` | 12,389 bytes | `85000F39099C10D85D9539827EAA1FBF723015B0BD7B5D0C7E13550067C23AD6` |
| `frontend/demo-local-basil-app.html` | 28,878 bytes | `167F26D59DFF05D0B97B7D568061AB1B635A3B40C6C4891F174BE33276950297` |
| `frontend/motokraf-site-ico.webp` | 19,016 bytes | `E28040B10FF43BC0247E2660FC03CC0F22631F02800C82F96BF67B2F911913FA` |
| `MIGRATION_DESIGN_FLOW_LIVE_VALIDATION_2026-09-11.md` | 7,138 bytes | `9D39D12DCF4EF17158EA1628B976D39F8682EAD3198C0E1B671DFEDFCAE86776` |

## Validasi yang tersedia

- Syntax wrapper demo: sudah diperiksa pada sesi sebelumnya.
- Local HTTP surface: sudah merespons HTTP 200 pada `127.0.0.1:3000`.
- Visual mobile: sudah diperiksa pada viewport sekitar 390×844 untuk login/dashboard/flow utama demo.
- Production design migration: **NOT EXERCISED**.
- Production data preservation: **NOT PROVEN** karena belum ada backup/export production yang direkonsiliasi.
- Apps Script deployment/version dan Sheet/Drive identity: **belum diverifikasi ulang pada checkpoint ini**.

## Guardrail data

1. Tidak mengubah, menghapus, atau memindahkan data operasional production.
2. Tidak mengubah header/schema Sheets.
3. Tidak mengganti `job_id`, `payment_id`, `expense_id`, `media_id`, timestamp, status, atau relasi existing.
4. Demo lokal tidak boleh dijadikan source of truth production.
5. Migrasi live harus melalui backup, branch/deployment lineage, preview/staging, smoke test, dan rollback gate.

## Status repository

- Workspace lokal belum memiliki commit baseline yang dapat dipakai untuk rollback.
- Workspace lokal belum memiliki origin remote yang terhubung.
- GitHub `main` belum berisi source aplikasi.
- Sinkronisasi berikutnya dilakukan ke branch baru, bukan menimpa `main`, dan akan dipisahkan dari data/credential production.

## Langkah berikutnya yang aman

1. Upload checkpoint ini ke folder Drive khusus migrasi.
2. Buat branch GitHub khusus checkpoint/migrasi.
3. Masukkan source demo dan dokumentasi yang diperlukan ke branch tersebut.
4. Verifikasi isi repo dan checksum setelah commit.
5. Baru lakukan audit read-only terhadap deployment live dan resource Apps Script/Sheets/Drive.
6. Migrasi production hanya setelah backup dan rollback gate disetujui.

## Keputusan checkpoint

**READY FOR REPOSITORY/DOCUMENTATION SYNC; NOT READY FOR PRODUCTION DEPLOYMENT.**

