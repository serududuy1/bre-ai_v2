from pydantic import BaseModel


class ModuleUpdate(BaseModel):
    description: str | None = None
    enabled: bool | None = None
