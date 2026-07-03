from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.activity import ActivityLog
from models.setting import UserSetting
from models.user import User
from schemas.setting import SettingsUpdate

router = APIRouter(prefix="/api/users", tags=["User Settings"])


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {"user": current_user}


@router.get("/settings")
def get_settings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    setting = db.query(UserSetting).filter(UserSetting.user_id == current_user.id).first()
    return {"settings": setting}


@router.put("/settings")
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    setting = db.query(UserSetting).filter(UserSetting.user_id == current_user.id).first()
    if not setting:
        setting = UserSetting(user_id=current_user.id)
        db.add(setting)

    setting.display_name = payload.display_name
    setting.theme = payload.theme
    setting.notifications_enabled = payload.notifications_enabled

    db.add(
        ActivityLog(
            action="settings_updated",
            description="User settings diperbarui",
            user_id=current_user.id,
        )
    )
    db.commit()
    db.refresh(setting)
    return {"settings": setting}
