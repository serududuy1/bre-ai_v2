# Bre-AI

Bre-AI adalah starter aplikasi AI internal dengan React, FastAPI, PostgreSQL, dan Docker Compose.

## Fitur

- Login berbasis JWT
- Dashboard ringkas
- Auto Recon untuk rekonsiliasi multiple files
- Database browser untuk melihat ringkasan tabel
- File Upload
- History aktivitas
- User Settings
- Module Manager

## Menjalankan dengan Docker

Edit konfigurasi di `.env` jika perlu, terutama `POSTGRES_PASSWORD`, `JWT_SECRET`, dan `DEFAULT_ADMIN_PASSWORD`.

```bash
docker compose up --build
```

Frontend: http://localhost:5173

Backend API: http://localhost:8000/docs

Login awal:

- Email: `admin@bre.ai`
- Password: `admin123`

## Auto Recon

Auto Recon dipakai untuk rekonsiliasi data dari beberapa file sekaligus. Prosesnya berjalan di backend FastAPI menggunakan Python.

Format file yang didukung:

- `.csv`
- `.tsv` atau `.tab`
- `.txt` dengan format delimiter
- `.json` berupa array object atau object dengan field `rows`/`data`

Cara pakai dari frontend:

1. Login ke Bre-AI.
2. Buka menu `Auto Recon`.
3. Pilih minimal 2 file.
4. Isi `Key Column` jika ingin menentukan kolom pencocokan, misalnya `transaction_id`.
5. Jika `Key Column` kosong, sistem akan mencoba mendeteksi kolom umum seperti `id`, `transaction_id`, `reference`, `ref_no`, `invoice_no`, atau `account_no`.
6. Klik `Jalankan Recon`.

Contoh CSV:

```csv
transaction_id,amount,status
TRX001,100000,settled
TRX002,250000,pending
```

Output yang ditampilkan:

- `Total Keys`: jumlah key unik dari semua file
- `Matched`: key yang ada di semua file
- `Missing`: key yang hilang di salah satu file
- `Mismatch`: jumlah perbedaan nilai pada kolom yang sama
- `Duplicate`: key duplikat per file

Endpoint backend:

- `POST /api/autorecon/reconcile`
- `GET /api/autorecon/jobs`

Hasil rekonsiliasi disimpan dalam format JSON ke folder `storage/outputs`.

Error handler backend sudah dibuat global di `backend/middleware/error_handlers.py`, sehingga error validasi, HTTP error, dan server error dikembalikan dalam format JSON konsisten.

## Struktur

- `frontend`: aplikasi React
  - `src/pages`: halaman Login, Dashboard, Auto Recon, Database, File Upload, History, User Settings, Module Manager
  - `src/components`: komponen UI reusable
  - `src/layouts`: layout aplikasi
  - `src/hooks`: hook akses API
  - `src/services`: service client untuk auth/session
- `backend`: aplikasi FastAPI
  - `api`: router HTTP per domain
  - `middleware`: CORS dan global error handler
  - `services`: business logic per domain
  - `models`: model database SQLAlchemy
  - `schemas`: kontrak request/response Pydantic
- `backend/database/init.sql`: schema dan seed PostgreSQL
- `.env`: konfigurasi lokal Docker, database, JWT, CORS, dan admin awal
- `.env.example`: template konfigurasi untuk environment lain
- `storage`: tempat upload, output, model, dan log
