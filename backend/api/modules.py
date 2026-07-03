from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from schemas.module import ModuleUpdate
from services.module_service import list_modules as get_modules
from services.module_service import update_module as save_module

router = APIRouter(prefix="/modules", tags=["Module Manager"])


@router.get("")
def list_modules(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"modules": get_modules(db)}


@router.patch("/{module_id}")
def update_module(
    module_id: int,
    payload: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    module = save_module(db, module_id, payload, current_user)
    if not module:
        raise HTTPException(status_code=404, detail="Module tidak ditemukan.")
    return {"module": module}
