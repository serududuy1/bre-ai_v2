from datetime import timedelta

from sqlalchemy.orm import Session

from auth.security import create_access_token, verify_password
from models.user import User
from utils.config import settings


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def build_token_response(user: User) -> dict:
    token = create_access_token(
        subject=user.email,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    return {"access_token": token, "token_type": "bearer", "user": user}
