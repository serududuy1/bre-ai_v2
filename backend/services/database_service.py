from sqlalchemy import text
from sqlalchemy.orm import Session

SUMMARY_TABLES = ["users", "modules", "uploaded_files", "activity_logs", "user_settings"]


def get_public_tables(db: Session) -> list[str]:
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
    return [row["table_name"] for row in rows]


def get_database_summary(db: Session) -> dict[str, int]:
    summary = {}
    for table in SUMMARY_TABLES:
        count = db.execute(text(f"select count(*) as total from {table}")).mappings().first()
        summary[table] = count["total"] if count else 0
    return summary
