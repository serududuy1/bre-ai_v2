from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.activity import ActivityLog
from models.file import UploadedFile
from models.module import Module
from models.user import User

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_files = db.query(func.count(UploadedFile.id)).scalar() or 0
    total_modules = db.query(func.count(Module.id)).scalar() or 0
    active_modules = db.query(func.count(Module.id)).filter(Module.enabled.is_(True)).scalar() or 0
    history_count = db.query(func.count(ActivityLog.id)).scalar() or 0
    recent_history = (
        db.query(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .limit(6)
        .all()
    )

    return {
        "stats": {
            "files": total_files,
            "modules": total_modules,
            "active_modules": active_modules,
            "history": history_count,
        },
        "recent_history": recent_history,
        "user": current_user,
    }
