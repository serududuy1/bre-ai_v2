from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Bre-AI"
    app_env: str = "development"
    database_url: str = "postgresql+psycopg://bre_user:bre_password@localhost:5432/bre_ai"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 720
    default_admin_email: str = "admin@bre.ai"
    default_admin_password: str = "admin123"
    default_admin_display_name: str = "Admin Bre-AI"
    upload_dir: str = "storage/uploads"
    output_dir: str = "storage/outputs"
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
