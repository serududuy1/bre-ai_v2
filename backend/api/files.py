from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from services.file_service import list_uploaded_files, save_upload

router = APIRouter(prefix="/files", tags=["File Upload"])


@router.get("")
def list_files(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"files": list_uploaded_files(db)}


@router.post("/upload")
def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_file = save_upload(db, file, current_user)
    return {"file": saved_file}
