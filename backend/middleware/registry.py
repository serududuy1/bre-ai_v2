from fastapi import FastAPI

from middleware.cors import register_cors
from middleware.error_handlers import register_error_handlers


def register_middlewares(app: FastAPI) -> None:
    register_cors(app)
    register_error_handlers(app)
