# Staging Dummy Data — Tiga Bulan

Tanggal seed: 2026-09-12  
Lingkup: staging terisolasi saja — **bukan production**

## Target

- Spreadsheet: `STAGING_MVP_DATA_STORE_2026-09-12`
- Spreadsheet ID: `1jZDuotUlB0_15PD518SZS8ylxHMeyHFrGmMwrp4_g-0`
- Apps Script: deployment staging yang terhubung ke spreadsheet di atas
- Penanda: `STAGING ONLY | DUMMY 3M`
- Periode: 2026-07-01 sampai 2026-09-30

## Data yang ditambahkan

| Tab | Baris dummy | Isi |
|---|---:|---|
| Jobs | 7 | 6 CLOSED dan 1 IN_PROGRESS; 2 CLOSED per bulan |
| Payments | 6 | Satu Payment untuk setiap Job CLOSED |
| Expenses | 6 | Dua Expense per bulan |
| Media | 0 | Tidak diperlukan untuk pengujian tarik/sort/laporan |

ID dummy menggunakan prefix `DUMMY` sehingga terpisah dari ID uji sebelumnya.

## Validasi read-only setelah seed

- Riwayat CLOSED lintas periode mengembalikan 6 Job dummy.
- Urutan `closed_at` descending: 2026-09-11, 2026-09-04, 2026-08-23, 2026-08-05, 2026-07-19, 2026-07-03.
- Expense lintas periode mengembalikan 6 Expense dummy dalam urutan tanggal descending.
- Semua 6 Payment memiliki `job_id` yang cocok dengan Job CLOSED.
- Tidak ada `inconsistencies` pada recap bulanan.
- Job dummy aktif September tetap berstatus `IN_PROGRESS` dan tidak memiliki Payment.

## Rekap dummy per bulan

| Bulan | Pemasukan | Pengeluaran | Selisih | CLOSED |
|---|---:|---:|---:|---:|
| Juli 2026 | Rp700.000 | Rp225.000 | Rp475.000 | 2 |
| Agustus 2026 | Rp540.000 | Rp295.000 | Rp245.000 | 2 |
| September 2026 | Rp1.082.000 | Rp281.000 | Rp801.000 | 4* |

`*` termasuk 2 Job CLOSED dummy dan 2 Job CLOSED synthetic staging yang sudah ada sebelumnya.

Production Vercel, Apps Script, spreadsheet, Drive media, dan data operasional existing tidak menjadi target write dan tidak diubah.
