from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.connection import get_db
from models.user import User

router = APIRouter(prefix="/api/database", tags=["Database"])


@router.get("/tables")
def list_tables(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = db.execute(
        text(
            """
            select table_name
            from information_schema.tables
            where table_schema = 'public'
            order by table_name
            """
        )
    ).mappings()
    return {"tables": [row["table_name"] for row in rows]}


@router.get("/summary")
def database_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    summary = {}
    for table in ["users", "modules", "uploaded_files", "activity_logs", "user_settings"]:
        count = db.execute(text(f"select count(*) as total from {table}")).mappings().first()
        summary[table] = count["total"] if count else 0
    return {"summary": summary}
