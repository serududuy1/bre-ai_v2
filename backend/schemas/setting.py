from pydantic import BaseModel


class SettingsUpdate(BaseModel):
    display_name: str
    theme: str = "system"
    notifications_enabled: bool = True
