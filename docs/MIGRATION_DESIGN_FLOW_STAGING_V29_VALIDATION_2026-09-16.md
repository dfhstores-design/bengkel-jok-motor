# Motokraf staging v29 validation — 2026-09-16

Status: **PARTIAL PASS — belum siap deployment production.**

## Kandidat dan pasangan staging

| Item | Bukti |
|---|---|
| Frontend source | Commit `b680c6532e1a020ffceee16204e2b388000834fb` (`Remove plaintext staging auth seed PIN`) |
| Vercel Preview | `https://aplikasi-bengkel-staging-20260912-2dwfqqf2u-dfhstores-projects.vercel.app` |
| Vercel deployment | `dpl_JMKbo8xMsPFMuWuZ8i9ymQEJJvLT`, Preview, READY |
| Vercel source metadata | SHA sama dengan commit di atas. `gitDirty=1` tercatat karena perubahan ignore file milik user; pemeriksaan local diff memastikan tidak ada source frontend yang berubah setelah commit selain `frontend/.gitignore`. |
| Apps Script staging | v29, `Remove plaintext staging auth seed PIN 2026-09-16`; deployment baru dibuat dari v29. |
| Pairing | Variabel Preview `APPS_SCRIPT_API_URL` ditimpa sebagai sensitive variable ke deployment staging v29, kemudian Preview baru dibangun. Tidak ada environment Production yang diubah. |

## Perbaikan

Helper `seedStagingAuthUsers` tidak lagi menghitung hash dari PIN literal di source. Jika Sheet staging masih kosong, helper memerlukan Script Property `STAGING_AUTH_SEED_PIN_HASH` yang berupa hash SHA-256 valid. Staging yang aktif sudah memiliki dua user sintetis sehingga perubahan tidak menulis data.

## Validasi

| Check | Hasil |
|---|---|
| Node regression suite | PASS, 14/14 termasuk guard source tanpa PIN seed literal. |
| Syntax Apps Script | PASS pada source repo dan checkout staging. |
| Apps Script v29 archive | PASS, lima file clone immutable sama dengan checkout staging; nol literal PIN pada field PIN. |
| Vercel build | PASS, 19 route. Ada delapan warning CSS lama dari Autoprefixer tentang `flex-end`; tidak ada error build. |
| Preview mobile 390×844 | PASS. Login page memiliki konten, dropdown pengguna, keypad, 13 tombol, tanpa overflow horizontal dan tanpa error overlay. |
| Console mobile | PASS WITH EXPECTED RESPONSE. Satu HTTP 401 berasal dari `/api/auth/session` ketika belum ada sesi; ini adalah perilaku login awal yang diharapkan. |
| User lookup | PASS. Tiga pembacaan menghasilkan HTTP 200 dan dua user aktif; 1.17 s, 4.25 s, 4.84 s. Bentuk respons tidak memuat key PIN/hash/token/secret. |
| Gate tanpa sesi | PASS. Dashboard, Jobs, Expenses, History, Report, dan Recap mengembalikan HTTP 401 tanpa sesi. Tidak ada POST yang dikirim. |

## Bukti visual

`qa-evidence/staging-v29-login-390x844-20260916.png`, SHA-256 `DE1DE03E3AB3E2893EADCD9155621B2603845C5ABF852DAC14A960299273E473`.

## Gap yang masih terbuka

1. Login Owner/Operator, refresh session, logout, role denial, dan perubahan PIN belum dibuktikan pada candidate v29 karena PIN tidak diambil/ditulis ke artefak. Uji expiry aktual tetap **SKIP — disetujui user**.
2. Alur tulis staging yang diizinkan (Job, idempotensi multiple submit, Payment/Close Job, media, Expense, edit riwayat/audit) belum dijalankan pada v29.
3. Filter semua periode, grafik per hari, dashboard Owner/Operator, dan unduhan PDF/Excel belum diuji ulang pada v29 dengan sesi sah. Persetujuan user sebelumnya dan regresi lokal tetap tercatat, tetapi bukan bukti E2E kandidat ini.
4. Reliabilitas POST Apps Script masih blocker: pembacaan baru menunjukkan rentang 1.17–4.84 s, tetapi belum ada sampel POST idempotent yang aman pada pasangan v29.
5. Gate production tetap terbuka: refresh backup tepat sebelum rollout, identitas/permission resource production, integritas read-only, dan smoke test/rollback production. Tidak ada tindakan production pada tahap ini.

## Safety record

Tidak ada deployment, konfigurasi, API write, schema, Sheet, Drive media, atau data operational production yang diubah. Staging hanya menerima source Apps Script v29, deployment v29, dan Preview Vercel baru. Dashboard Owner/Operator tidak diubah.
