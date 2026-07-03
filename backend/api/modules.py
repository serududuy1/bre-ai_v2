from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.activity import ActivityLog
from models.module import Module
from models.user import User
from schemas.module import ModuleUpdate

router = APIRouter(prefix="/api/modules", tags=["Module Manager"])


@router.get("")
def list_modules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    modules = db.query(Module).order_by(Module.name.asc()).all()
    return {"modules": modules}


@router.patch("/{module_id}")
def update_module(
    module_id: int,
    payload: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module tidak ditemukan.")

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
    return {"module": module}
