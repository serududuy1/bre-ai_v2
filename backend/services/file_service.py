import shutil
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from models.activity import ActivityLog
from models.file import UploadedFile
from models.user import User
from utils.config import settings


def list_uploaded_files(db: Session) -> list[UploadedFile]:
    return db.query(UploadedFile).order_by(UploadedFile.created_at.desc()).all()


def save_upload(db: Session, file: UploadFile, current_user: User) -> UploadedFile:
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    target = upload_dir / file.filename

    with target.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    saved_file = UploadedFile(
        filename=file.filename,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=target.stat().st_size,
        path=str(target),
        owner_id=current_user.id,
    )
    db.add(saved_file)
    db.flush()

    db.add(
        ActivityLog(
            action="file_uploaded",
            description=f"Upload file {file.filename}",
            user_id=current_user.id,
        )
    )
    db.commit()
    db.refresh(saved_file)
    return saved_file
