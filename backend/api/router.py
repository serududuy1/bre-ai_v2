from fastapi import APIRouter

from api import auth, autorecon, dashboard, database, files, history, modules, users

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(autorecon.router)
api_router.include_router(dashboard.router)
api_router.include_router(database.router)
api_router.include_router(files.router)
api_router.include_router(history.router)
api_router.include_router(modules.router)
api_router.include_router(users.router)
