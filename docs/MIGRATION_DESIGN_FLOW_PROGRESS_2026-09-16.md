# Checkpoint menuju deploy — 2026-09-16

Status: **LANJUT PRA-DEPLOY / BELUM SIAP DEPLOY PRODUCTION**

> Catatan: ini adalah catatan preflight tahap awal. Pairing kandidat, perbaikan PIN literal, dan validasi Preview v29 yang dilakukan setelahnya dicatat dalam `MIGRATION_DESIGN_FLOW_STAGING_V29_VALIDATION_2026-09-16.md`; gunakan dokumen v29 tersebut sebagai status staging terbaru.

## Ringkasan tahap

Checkpoint ini menyegarkan bukti pra-deploy yang dapat diperiksa tanpa mengubah data. Production deployment tidak dilakukan. Tidak ada permintaan tulis ke Apps Script/Sheet production, tidak ada cleanup, dan tidak ada synthetic data yang dibuat atau dihapus.

## Fakta diverifikasi pada 2026-09-16

| Area | Bukti sekarang | Status |
|---|---|---|
| Workspace | Repository `D:\\Documents\\AI-GPT\\Aplikasi Bengkel Jok Motor\\repo-checkout`; branch `codex/operator-idle-timeout-2026-09-15`; HEAD `f10a9cb30f0ddccc2899de55be7da01e00ba16b1` | Diverifikasi |
| Perubahan user lokal | `.gitignore`, `frontend/.gitignore`, checkpoint 2026-09-15 dan tiga screenshot belum terlacak tetap terpisah. Tidak diubah/stage/dibuang. | Dipertahankan |
| Candidate preview | Vercel CLI `inspect`: URL `https://aplikasi-bengkel-staging-20260912-iadi01rsv-dfhstores-projects.vercel.app`, deployment `dpl_H9hwFwN5CgxkV4WxorhV1gmTq2rk`, target Preview, READY. | Diverifikasi |
| Auth gate tanpa sesi | GET `/api/dashboard`, `/api/jobs`, `/api/expenses`, `/api/history`, `/api/report`, `/api/recap`: semua merespons HTTP 401 dan envelope gagal. GET `/api/payments` memberi 405 karena endpoint tersebut hanya menerima POST; tidak dikirim request POST. | PASS terbatas ke penolakan GET tanpa sesi |
| Pengguna login | Tiga pembacaan `/api/auth/users` sebelumnya pada candidate yang sama: HTTP 200, daftar 2 pengguna, sekitar 1.02–2.01 detik. Tidak ada field PIN/hash/token pada bentuk respons. | Bukti terbaru sebelumnya; pengukuran tidak diulang pada langkah ini |
| Unit/regresi | `node --test tests\\*.test.mjs`: 13/13 PASS, termasuk expiry boundary, retry idempotent, export PDF/Excel dan periode Payment. | Diverifikasi |
| Build | `npm run build` di `frontend`: Next.js production build dan pemeriksaan tipe sukses, 19 halaman/rute. | Diverifikasi |
| Diff whitespace | `git diff --check` sukses; hanya peringatan normal konversi LF/CRLF untuk `.gitignore` lokal. | PASS |
| Perubahan dashboard | Tidak ada file dashboard diubah untuk langkah ini. | Sesuai instruksi |

## Gap tersisa sebelum permintaan persetujuan deployment

1. **Identitas/pasangan Apps Script belum direkonsiliasi ulang.** Dokumen validasi lama mencatat staging v28 tetapi juga menyebut konfigurasi preview ke v27. Akses CLI Vercel memastikan deployment preview; itu sendiri tidak membuktikan URL Apps Script yang aktif, project/deployment/version staging, atau izin backend. Jangan menganggap angka v27/v28 benar sampai ada bukti read-only yang menghubungkan preview ke identitas staging dan versi tertentu.
2. **E2E login Owner/Operator pada candidate terbaru belum dijalankan dalam tahap ini.** Memerlukan kredensial PIN yang diberikan melalui jalur aman; tidak membaca atau menebak PIN. Uji expiry aktual 2/6 jam tetap **SKIP sesuai persetujuan user**.
3. **Alur operasional yang menulis data** (Job, Payment/Close Job, media, Expense, edit riwayat/audit, multi-submit) belum diulang pada candidate dan staging yang identitasnya baru diverifikasi. Tidak menjalankan probe tulis sebelum pasangan staging terkonfirmasi dan skenario terisolasi disetujui.
4. **Filter/periode, grafik harian, dashboard mobile 390×844, dan download PDF/Excel**: kode/tests lokal lulus dan hasil PDF/Excel telah di-approve user; pemeriksaan visual/download terhadap preview terbaru belum diulang pada checkpoint ini.
5. **Reliabilitas POST Apps Script** belum memiliki pengukuran staging berulang yang terikat pada candidate dan versi backend yang sama. Tes retry unit bukan bukti bahwa Apps Script hidup/reliable.
6. **Gate production**: deployment/Vercel lineage telah diinspeksi sebelumnya via CLI, tetapi identitas production Apps Script, Sheet, folder media, permission/configuration, rollback operasional dan smoke read-only belum terkumpul menjadi bukti satu paket. Backup valid 2026-09-15 22:41 WIB adalah snapshot historis; perlu dibuat/validasi ulang segera sebelum rollout yang disetujui.
7. `gitDirty=1` pada metadata preview yang ditemukan sebelumnya perlu dijelaskan terhadap snapshot build. Perubahan lokal saat ini adalah konfigurasi ignore dan bukti/screenshots yang dipertahankan; jangan klaim artefak build identik dengan commit tanpa menelusuri metadata Vercel tersebut.

## Keputusan tahap berikutnya

Status tetap **NOT READY FOR PRODUCTION APPROVAL**. Tahap paling aman berikutnya adalah membuktikan pairing preview → Apps Script staging secara read-only; setelah itu lakukan E2E staging yang diizinkan dan idempotent, kumpulkan bukti UI/periode/unduhan/latensi, lalu siapkan backup dan rollback. Minta persetujuan eksplisit hanya setelah paket review lengkap. Tidak ada production deployment dalam checkpoint ini.
