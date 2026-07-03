from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User
from services.database_service import get_database_summary, get_public_tables

router = APIRouter(prefix="/database", tags=["Database"])


@router.get("/tables")
def list_tables(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"tables": get_public_tables(db)}


@router.get("/summary")
def database_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"summary": get_database_summary(db)}
