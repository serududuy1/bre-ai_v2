# Bre-AI

Bre-AI adalah starter aplikasi AI internal dengan React, FastAPI, PostgreSQL, dan Docker Compose.

## Fitur

- Login berbasis JWT
- Dashboard ringkas
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

## Struktur

- `frontend`: aplikasi React
  - `src/pages`: halaman Login, Dashboard, Database, File Upload, History, User Settings, Module Manager
  - `src/components`: komponen UI reusable
  - `src/layouts`: layout aplikasi
  - `src/hooks`: hook akses API
  - `src/services`: service client untuk auth/session
- `backend`: aplikasi FastAPI
  - `api`: router HTTP per domain
  - `services`: business logic per domain
  - `models`: model database SQLAlchemy
  - `schemas`: kontrak request/response Pydantic
- `backend/database/init.sql`: schema dan seed PostgreSQL
- `.env`: konfigurasi lokal Docker, database, JWT, CORS, dan admin awal
- `.env.example`: template konfigurasi untuk environment lain
- `storage`: tempat upload, output, model, dan log
