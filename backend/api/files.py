import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.activity import ActivityLog
from models.file import UploadedFile
from models.user import User
from utils.config import settings

router = APIRouter(prefix="/api/files", tags=["File Upload"])


@router.get("")
def list_files(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    files = db.query(UploadedFile).order_by(UploadedFile.created_at.desc()).all()
    return {"files": files}


@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    return {"file": saved_file}
