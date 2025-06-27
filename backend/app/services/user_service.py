from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, Response, Depends, status, Cookie
from passlib.context import CryptContext
from datetime import timedelta, datetime
from typing import Annotated, List
from jwt.exceptions import InvalidTokenError
import jwt
import re

from app.models.models import User
from app.repositories import user_repository
from app.schemas.user import UserCreate, UserUpdate, Token
from app.schemas.support import SupportProfileUpdate
from app.core.config import settings
from app.database import get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
SessionDep = Annotated[Session, Depends(get_db)]

def validate_password_strength(password: str):
    if len(password) < 8 or not re.search(r"[A-Z]", password) or not re.search(r"[0-9]", password) or not re.search(r"[\W_]", password):
        raise HTTPException(status_code=400, detail="Password must meet complexity requirements")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(session: Session, email: str) -> User:
    return user_repository.get_user_by_email(session, email)

def get_current_user(session: SessionDep, token: Annotated[str | None, Cookie(alias="access_token")]):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = get_user(session, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def role_check(allowed_roles: List[str]):
    def dependency(current_user: Annotated[User, Depends(get_current_user)]):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user
    return dependency

def signup_user(db: Session, user_create: UserCreate):
    validate_password_strength(user_create.password)
    if user_repository.get_user_by_email(db, user_create.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    user_create.password = hash_password(user_create.password)
    return user_repository.create_user(db, user_create)

def login_user(session: SessionDep, email: str, password: str, response: Response) -> Token:
    user = get_user(session, email)
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="Lax", secure=False)
    return Token(access_token=access_token, token_type="bearer")

def login_customer(session: SessionDep, email: str, password: str, response: Response) -> Token:
    user = get_user(session, email)
    if not user or not verify_password(password, user.password) or user.role != "customer":
        raise HTTPException(status_code=403, detail="Invalid credentials or role")

    access_token = create_access_token({"sub": user.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="Lax", secure=False)
    return Token(access_token=access_token, token_type="bearer")

def logout(response: Response):
    response.delete_cookie("access_token")
    return {"detail": "Logout successful"}

def update_user(db: Session, user_id: int, user_update: UserUpdate):
    if user_update.password:
        validate_password_strength(user_update.password)
        user_update.password = hash_password(user_update.password)
    return user_repository.update_user(db, user_id, user_update)

def restore_users(db: Session, user_ids: List[int]):
    return user_repository.restore_users(db, user_ids)

def restore_user(db: Session, user_id: int):
    return user_repository.restore_user(db, user_id)

def archive_user(db: Session, user_id: int):
    return user_repository.archive_user(db, user_id)



# get profil zaposlenika
def get_support_profile_service(session, user_id: int):
    user = user_repository.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }


# zaposlenik azurira profil
def update_support_profile_service(session, user_id: int, update_data: SupportProfileUpdate, current_user_id: int):
    if current_user_id != user_id:
        raise HTTPException(status_code=403, detail="Cannot edit another user's profile")
    user = user_repository.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    name = update_data.name
    password = update_data.password
    if password:
        validate_password_strength(password)
        password = hash_password(password)
    updated_user = user_repository.update_support_profile(session, user_id, name, password)
    return {
        "id": updated_user.id,
        "email": updated_user.email,
        "name": updated_user.name,
        "role": updated_user.role
    }



