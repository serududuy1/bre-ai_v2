from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from schemas.setting import SettingsUpdate
from services.user_service import get_user_settings, update_user_settings

router = APIRouter(prefix="/users", tags=["User Settings"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"user": current_user}


@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"settings": get_user_settings(db, current_user)}


@router.put("/settings")
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = update_user_settings(db, current_user, payload)
    return {"settings": setting}
