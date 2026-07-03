from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.activity import ActivityLog
from models.user import User

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("")
def list_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entries = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(100).all()
    return {"history": entries}
