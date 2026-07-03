from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from services.autorecon_service import list_reconciliation_jobs, run_reconciliation

router = APIRouter(prefix="/autorecon", tags=["Auto Recon"])


@router.get("/jobs")
def list_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"jobs": list_reconciliation_jobs(db)}


@router.post("/reconcile")
async def reconcile_files(
    files: list[UploadFile] = File(...),
    key_column: str | None = Form(default=None),
    job_name: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await run_reconciliation(db, files, current_user, key_column, job_name)
    return {"result": result}
