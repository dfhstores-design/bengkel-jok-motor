# Arsip versi Apps Script staging — 2026-09-16

Status: **PASS — source immutable v1–v28 telah diarsipkan dalam bentuk aman tanpa menimpa versi lama.**

## Isi arsip

- Berkas lokal: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\checkpoints\APPS_SCRIPT_STAGING_VERSIONS_SANITIZED_v01-v28_2026-09-16.zip`
- SHA-256: `A4ED208A93025CAF73F1A6F78B1A617E4D09EAC87740D21A62AB4B4383D3A19B`
- Cakupan: 28 versi, 134 file source, 134 entri ZIP.
- Format: setiap versi berada dalam folder `version-01` sampai `version-28`. Versi 1–6 masing-masing memiliki empat file source; versi 7–28 masing-masing memiliki lima file source.
- Berkas konfigurasi lokal `.clasp.json` tidak disertakan dalam ZIP. Literal PIN numerik lama pada source historis disanitasi menjadi penanda `__REDACTED_PIN__`; 29 file disanitasi dan pemeriksaan akhir menemukan nol literal PIN numerik. Source immutable asli tetap berada pada riwayat Apps Script staging, bukan di Drive/repo.

## Daftar versi yang diambil dari Apps Script staging

| Versi | Deskripsi immutable |
|---:|---|
| 1–4 | Staging synthetic validation 2026-09-12 / tanpa deskripsi pada v4 |
| 5 | Staging synthetic validation 2026-09-12 schema fix |
| 6 | Tanpa deskripsi |
| 7–8 | Auth staging foundation 2026-09-12 |
| 9–10 | Auth staging smoke evidence 2026-09-12 |
| 11 | Auth frontend session backend staging 2026-09-12 |
| 12 | Server-side action gate staging 2026-09-12 |
| 13 | Auth public staging 2026-09-12 |
| 14 | Auth anonymous staging 2026-09-12 |
| 15–17 | Owner history audit staging 2026-09-12 |
| 18 | Audit diagnostics staging 2026-09-12 |
| 19 | Audit failure diagnosis staging 2026-09-12 |
| 20 | Owner history edit UI staging 2026-09-12 |
| 21 | Actor identity staging 2026-09-12 |
| 22 | Staging synthetic stress seed 350 2026-09-12 |
| 23 | Staging synthetic stress seed diagnostics 2026-09-12 |
| 24 | Staging synthetic stress seed distribution fix 2026-09-12 |
| 25 | Combined Owner report read staging 2026-09-15 |
| 26 | PIN settings and auth cache staging 2026-09-15 |
| 27 | Role-specific idle timeout staging 2026-09-15 |
| 28 | Payment-date report periods staging 2026-09-15 |

## Validasi dan batas

`clasp versions` dan `clasp deployments` dibaca langsung dari project staging pada 2026-09-16. Penyimpanan ini hanya mengambil source versi immutable; tidak membuat version/deployment Apps Script baru dan tidak mengubah Spreadsheet, Drive media, maupun data staging/production.

Versi 28 adalah deployment staging bernama `Payment-date report periods staging 2026-09-15`. Pairing preview ke deployment ini akan dicatat sebagai terverifikasi hanya setelah konfigurasi Preview diperiksa kembali secara read-only.

## Pemulihan

Untuk investigasi atau rollback source, ekstrak versi yang diperlukan ke direktori kerja baru, bandingkan dengan target deployment, lalu buat deployment baru hanya setelah review dan persetujuan yang sesuai. Jangan menimpa checkout atau deployment yang sedang aktif dengan isi ZIP ini.
