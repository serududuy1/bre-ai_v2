from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base


class AutoReconJob(Base):
    __tablename__ = "autorecon_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    job_name: Mapped[str] = mapped_column(String(160), nullable=False)
    key_column: Mapped[str] = mapped_column(String(120), nullable=False)
    input_files = mapped_column(JSONB, nullable=False, default=list)
    summary = mapped_column(JSONB, nullable=False, default=dict)
    output_path: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at = mapped_column(DateTime(timezone=True), server_default=func.now())
