from typing import Annotated,Literal, List
from fastapi import Depends
from sqlmodel import Session
from app.models.models import User
from app.repositories import user_repository
from fastapi import HTTPException
from app.core.config import settings
from passlib.context import CryptContext
from datetime import timedelta, datetime
from app.database import get_db
from app.schemas.user import LoginWithRole,Token
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
import jwt


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

SessionDep = Annotated[Session, Depends(get_db)]

def get_users(session: Session, offset: int = 0, limit: int = 100) -> list[User]:
    return user_repository.get_users(session, offset, limit)

def get_user(session: Session, email: str) -> User:
    return user_repository.get_user(session, email)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def login_for_access_token(session: SessionDep, login_data: LoginWithRole)-> Token:
    db_user = get_user(session, login_data["email"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not verify_password(login_data["password"], db_user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    """if login_data.role == "worker" and db_user.role not in ["manager", "support", "delivery"]:
        raise HTTPException(status_code=403, detail="You are not a worker.")
    elif login_data.role == "customer" and db_user.role != "customer":
        raise HTTPException(status_code=403, detail="You are not a customer.") """

    access_token_expires =timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

def get_current_user(session: SessionDep, token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms = [ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    db_user = get_user(session, email)
    if db_user is None:
        raise credentials_exception
    return db_user

def role_check(allowed_roles: List[Literal["administrator", "manager", "customer", "support", "delivery"]]):
    def dependency(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permission denied")
        return current_user
    return dependency