from sqlalchemy.orm import Session

from auth.security import hash_password
from models.activity import ActivityLog
from models.module import Module
from models.setting import UserSetting
from models.user import User
from utils.config import settings

MODULE_SEEDS = [
    ("chat", "Asisten percakapan untuk tanya jawab internal.", True),
    ("autorecon", "Otomasi rekonsiliasi multiple files dan pencocokan data.", True),
    ("ocr", "Ekstraksi teks dari dokumen dan gambar.", True),
    ("rag", "Retrieval augmented generation untuk knowledge base.", True),
    ("analytics", "Analisis metrik operasional dan aktivitas sistem.", True),
    ("monitoring", "Pemantauan kesehatan layanan dan pipeline.", True),
    ("scheduler", "Penjadwalan job otomatis.", False),
    ("notification", "Pengiriman notifikasi ke user dan channel eksternal.", True),
]


def seed_defaults(db: Session) -> None:
    user = db.query(User).filter(User.email == settings.default_admin_email).first()
    if not user:
        user = User(
            email=settings.default_admin_email,
            password_hash=hash_password(settings.default_admin_password),
            role="admin",
        )
        db.add(user)
        db.flush()

    setting = db.query(UserSetting).filter(UserSetting.user_id == user.id).first()
    if not setting:
        db.add(
            UserSetting(
                user_id=user.id,
                display_name=settings.default_admin_display_name,
            )
        )

    for name, description, enabled in MODULE_SEEDS:
        module = db.query(Module).filter(Module.name == name).first()
        if not module:
            db.add(Module(name=name, description=description, enabled=enabled))

    has_boot_log = db.query(ActivityLog).filter(ActivityLog.action == "system_ready").first()
    if not has_boot_log:
        db.add(
            ActivityLog(
                action="system_ready",
                description="Bre-AI backend berhasil membaca konfigurasi dari .env.",
                user_id=user.id,
            )
        )

    db.commit()
