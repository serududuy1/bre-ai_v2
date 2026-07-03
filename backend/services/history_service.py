from sqlalchemy.orm import Session

from models.activity import ActivityLog


def list_activity_history(db: Session, limit: int = 100) -> list[ActivityLog]:
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
