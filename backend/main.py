from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import auth, dashboard, database, files, history, modules, users
from database.connection import Base, engine
from utils.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(database.router)
app.include_router(files.router)
app.include_router(history.router)
app.include_router(modules.router)
app.include_router(users.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}
