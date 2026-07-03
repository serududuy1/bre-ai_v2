from sqlalchemy.orm import Session

from models.activity import ActivityLog
from models.setting import UserSetting
from models.user import User
from schemas.setting import SettingsUpdate


def get_user_settings(db: Session, current_user: User) -> UserSetting | None:
    return db.query(UserSetting).filter(UserSetting.user_id == current_user.id).first()


def update_user_settings(db: Session, current_user: User, payload: SettingsUpdate) -> UserSetting:
    setting = get_user_settings(db, current_user)
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
    return setting
