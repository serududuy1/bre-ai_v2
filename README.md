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
- `backend`: aplikasi FastAPI
- `backend/database/init.sql`: schema dan seed PostgreSQL
- `storage`: tempat upload, output, model, dan log
