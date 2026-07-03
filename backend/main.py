from fastapi import FastAPI

from api.router import api_router
from database.connection import Base, SessionLocal, engine
from middleware.registry import register_middlewares
from services.seed_service import seed_defaults
from utils.config import settings

Base.metadata.create_all(bind=engine)

def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version="1.0.0")

    register_middlewares(app)
    app.include_router(api_router)

    @app.get("/health")
    def health_check():
        return {"status": "ok", "service": settings.app_name}

    with SessionLocal() as db:
        seed_defaults(db)

    return app


app = create_app()
