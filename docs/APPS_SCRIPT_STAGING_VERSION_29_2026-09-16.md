# Arsip Apps Script staging v29 — 2026-09-16

Status: **PASS — source v29 dan deployment staging baru tercatat.**

## Identitas

| Item | Nilai |
|---|---|
| Versi immutable | 29 |
| Deskripsi | `Remove plaintext staging auth seed PIN 2026-09-16` |
| Perubahan | Helper seeding staging sekarang membutuhkan `STAGING_AUTH_SEED_PIN_HASH`; source tidak lagi memiliki PIN seed literal. |
| Deployment | Deployment Apps Script staging baru dibuat untuk versi 29. Identifier endpoint tidak dicantumkan dalam dokumen. |
| Preview frontend | Preview baru dibuat setelah variabel `APPS_SCRIPT_API_URL` Preview ditimpa secara sensitif ke deployment v29. |

## Arsip

- Berkas lokal: `D:\Documents\AI-GPT\Aplikasi Bengkel Jok Motor\checkpoints\APPS_SCRIPT_STAGING_VERSION_29_2026-09-16.zip`
- SHA-256: `6B8A4EDBCF17D8AC49B78D9C3547E345732870B3E3289B70AD7B2F017BF1D2A1`
- Isi: lima file source (`appsscript.json`, Auth, Code, IdGenerator, Response).
- Validasi: kelima file hasil clone immutable v29 sama dengan checkout staging saat deploy; pemeriksaan menemukan nol literal PIN pada field PIN.

## Batas

Pembuatan v29 mengubah source/deployment **staging saja**. Ia tidak menulis Sheet, media Drive, data sintetis, atau resource production. Uji login yang memerlukan PIN tidak dijalankan dalam tahap ini; pengujian harus memakai PIN melalui jalur aman tanpa merekamnya dalam artefak.
