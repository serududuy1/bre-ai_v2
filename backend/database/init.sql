create extension if not exists pgcrypto;

create table if not exists users (
    id serial primary key,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    role varchar(50) not null default 'admin',
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists modules (
    id serial primary key,
    name varchar(100) unique not null,
    description text not null,
    enabled boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists uploaded_files (
    id serial primary key,
    filename varchar(255) not null,
    content_type varchar(255) not null,
    size_bytes integer not null default 0,
    path text not null,
    owner_id integer references users(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists activity_logs (
    id serial primary key,
    action varchar(100) not null,
    description text not null,
    user_id integer references users(id) on delete set null,
    created_at timestamptz not null default now()
);

create table if not exists user_settings (
    id serial primary key,
    user_id integer unique references users(id) on delete cascade,
    display_name varchar(120) not null default 'Admin Bre-AI',
    theme varchar(20) not null default 'system',
    notifications_enabled boolean not null default true,
    updated_at timestamptz not null default now()
);

insert into users (email, password_hash, role)
values (
    'admin@bre.ai',
    '$plain$admin123',
    'admin'
)
on conflict (email) do nothing;

insert into user_settings (user_id, display_name)
select id, 'Admin Bre-AI' from users where email = 'admin@bre.ai'
on conflict (user_id) do nothing;

insert into modules (name, description, enabled)
values
    ('chat', 'Asisten percakapan untuk tanya jawab internal.', true),
    ('autorecon', 'Otomasi rekonsiliasi data dan pencocokan transaksi.', true),
    ('ocr', 'Ekstraksi teks dari dokumen dan gambar.', true),
    ('rag', 'Retrieval augmented generation untuk knowledge base.', true),
    ('analytics', 'Analisis metrik operasional dan aktivitas sistem.', true),
    ('monitoring', 'Pemantauan kesehatan layanan dan pipeline.', true),
    ('scheduler', 'Penjadwalan job otomatis.', false),
    ('notification', 'Pengiriman notifikasi ke user dan channel eksternal.', true)
on conflict (name) do nothing;

insert into activity_logs (action, description, user_id)
select 'system_ready', 'Bre-AI database berhasil diinisialisasi.', id
from users
where email = 'admin@bre.ai'
on conflict do nothing;
