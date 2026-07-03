from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
