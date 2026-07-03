from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from services.history_service import list_activity_history

router = APIRouter(prefix="/history", tags=["History"])


@router.get("")
def list_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"history": list_activity_history(db)}
