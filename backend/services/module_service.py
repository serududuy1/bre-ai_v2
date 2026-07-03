from sqlalchemy.orm import Session

from models.activity import ActivityLog
from models.module import Module
from models.user import User
from schemas.module import ModuleUpdate


def list_modules(db: Session) -> list[Module]:
    return db.query(Module).order_by(Module.name.asc()).all()


def update_module(db: Session, module_id: int, payload: ModuleUpdate, current_user: User) -> Module | None:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        return None

    if payload.enabled is not None:
        module.enabled = payload.enabled
    if payload.description is not None:
        module.description = payload.description

    db.add(
        ActivityLog(
            action="module_updated",
            description=f"Update module {module.name}",
            user_id=current_user.id,
        )
    )
    db.commit()
    db.refresh(module)
    return module
