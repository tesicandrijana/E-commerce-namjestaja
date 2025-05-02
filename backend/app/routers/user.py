from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List,Annotated
from datetime import timedelta, datetime
from sqlmodel import Field, Session, SQLModel, create_engine, select
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from app.services import user_service
from app.database import get_db
from app.schemas.user import Token

from app.schemas.user import UserCreate, UserSchema, LoginWithRole
from app.dependencies import get_admin_user
from app.crud import user
from app.models.models import User
from app.core.config import settings
from app.crud.user import (
    get_worker_request,
    create_worker_request,
    get_worker_request_by_user_id,
    update_user_role,
    get_user_stats,
    get_sales_stats,
    get_rating_stats
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SessionDep = Annotated[Session, Depends(get_db)]

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Signup (Only 'customer' role allowed)
@router.post("/signup", response_model=UserSchema)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    # Proveravamo da li je rola postavljena i da li je "customer"
    if user_create.role and user_create.role != "customer":
        raise HTTPException(status_code=400, detail="Only 'customer' role is allowed at signup")
    user_create.role = "customer"

    # Enkriptovanje lozinke pre nego što je pošaljemo u funkciju za kreiranje korisnika
    user_create.password = hash_password(user_create.password)

    # Kreiramo korisnika
    return user.create_user(db, user_create)

# Login
@router.post("/login")
def login_for_access_token(session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    login_data = {
        "email": form_data.username,
        "password": form_data.password
    }
    return user_service.login_for_access_token(session, login_data)

@router.get("/me")
async def read_users_me(session: SessionDep, current_user: Annotated[User, Depends(user_service.get_current_user)]):
    return current_user

# Customers can request to become workers
@router.post("/request-worker/{desired_role}")
def request_worker_access(desired_role: str, current_user: User = Depends(user_service.get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "customer":
        raise HTTPException(status_code=400, detail="Only customers can request to become workers")

    if desired_role not in ["manager", "support", "delivery"]:
        raise HTTPException(status_code=400, detail="Invalid role requested")

    existing_request = get_worker_request(db, current_user.id)
    if existing_request:
        raise HTTPException(status_code=400, detail="Worker request already submitted.")

    return create_worker_request(db, current_user.id, desired_role)

# Admin approves customer to become a worker
@router.post("/approve-worker/{user_id}")
def approve_worker_request(user_id: int, current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    worker_request = get_worker_request_by_user_id(db, user_id)
    if not worker_request:
        raise HTTPException(status_code=404, detail="Worker request not found")

    desired_role = worker_request.desired_role
    if desired_role == "manager":
        current_managers = user.count_users_by_role(db, "manager")
        if current_managers >= 3:
            raise HTTPException(status_code=400, detail="Cannot approve more than 3 managers")

    update_user_role(db, user_id, desired_role)
    return {"detail": f"Worker request approved, user role updated to '{desired_role}'"}

# Admin can create users (if you want to keep this route)
@router.post("/", response_model=UserSchema)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return user.create_user(db, user_data)

# Get all users (admin only)
@router.get("/", response_model=List[UserSchema])
def read_users(
    session: SessionDep,
    current_user: Annotated[User, Depends(user_service.role_check(["admin"]))],
    offset: int = 0,
    limit: int = 100,
):
    return user_service.get_users(session,offset, limit)

# Get user by ID
@router.get("/{user_id}", response_model=UserSchema)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/admin/stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["customer"]))):
    return {
        "users": get_user_stats(db),
        "sales": get_sales_stats(db),
        "ratings": get_rating_stats(db),
    }