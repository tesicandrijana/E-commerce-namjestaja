from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime
import jwt

from app.schemas.user import UserCreate, UserSchema, LoginWithRole
from app.dependencies import get_current_user, get_db, get_admin_user
from app.crud import user
from app.models.models import User
from app.core.config import settings
from app.crud.user import (
    get_worker_request,
    create_worker_request,
    get_worker_request_by_user_id,
    update_user_role
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()


# Signup (Only 'customer' role allowed)
@router.post("/signup", response_model=UserSchema)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    if user_create.role and user_create.role != "customer":
        raise HTTPException(status_code=400, detail="Only 'customer' role is allowed at signup")
    user_create.role = "customer"
    return user.create_user(db, user_create)


# Login with role validation
@router.post("/login", response_model=dict)
def login_for_access_token(login_data: LoginWithRole, db: Session = Depends(get_db)):
    db_user = user.get_user_by_email(db, login_data.username)
    if not db_user or not db_user.verify_password(login_data.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if login_data.role == "worker" and db_user.role not in ["manager", "support", "delivery"]:
        raise HTTPException(status_code=403, detail="You are not a worker.")
    elif login_data.role == "customer" and db_user.role != "customer":
        raise HTTPException(status_code=403, detail="You are not a customer.")

    return {
        "access_token": create_access_token(data={"sub": db_user.id}),
        "token_type": "bearer"
    }


# Customers can request to become workers
@router.post("/request-worker/{desired_role}")
def request_worker_access(desired_role: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
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
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    return user.get_users(db, skip=skip, limit=limit)


# Get user by ID
@router.get("/{user_id}", response_model=UserSchema)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# Token generation function
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)