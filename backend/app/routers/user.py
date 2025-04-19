from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from app.schemas.user import UserCreate, UserSchema, LoginSchema
from app.dependencies import get_current_user, get_db, get_admin_user
from app.crud import user
from app.models.models import User
from datetime import timedelta, datetime
import jwt  
from app.core.config import settings
from app.crud.user import (
    get_worker_request,
    create_worker_request,
    get_worker_request_by_user_id,
    update_user_role_to_worker
)

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Create User
@router.post("/", response_model=UserSchema)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    return user.create_user(db, user_data)

# Read Users
@router.get("/", response_model=List[UserSchema])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return user.get_users(db, skip=skip, limit=limit)

# Read User
@router.get("/{user_id}", response_model=UserSchema)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = user.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Signup (Only 'customer' role allowed for signup)
@router.post("/signup", response_model=UserSchema)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    # Ensure only 'customer' role during signup
    if user_create.role and user_create.role != "customer":
        raise HTTPException(status_code=400, detail="Only 'customer' role is allowed at signup")
    user_create.role = "customer"  # Set the role to 'customer'
    return user.create_user(db, user_create)


# Login with OAuth2 (using form data)
@router.post("/login", response_model=dict)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user.get_user_by_email(db, form_data.username)
    if not user or not user.verify_password(form_data.password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    if form_data.role == "worker" and user.role == "customer":
        raise HTTPException(status_code=403, detail="You are not a worker.")

    if form_data.role == "customer" and user.role == "customer":
        return {"access_token": create_access_token(data={"sub": user.id}), "token_type": "bearer"}

    if form_data.role == "worker" and user.role == "worker":
        return {"access_token": create_access_token(data={"sub": user.id}), "token_type": "bearer"}

    raise HTTPException(status_code=400, detail="Invalid role selection.")


# Request to become a worker (only accessible by customers)
@router.post("/request-worker")
def request_worker_access(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "customer":
        raise HTTPException(status_code=400, detail="Only customers can request to become workers")
    
    # Check if the user has already requested to become a worker (optional check)
    existing_request = user.get_worker_request(db, current_user.id)
    if existing_request:
        raise HTTPException(status_code=400, detail="Worker request already submitted.")
    
    # Create worker request (assumes a function that handles this request)
    return user.create_worker_request(db, current_user.id)

@router.post("/approve-worker/{user_id}")
def approve_worker_request(user_id: int, current_user: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    # Check if the user has requested to become a worker
    worker_request = user.get_worker_request_by_user_id(db, user_id)
    if not worker_request:
        raise HTTPException(status_code=404, detail="Worker request not found")

    # Approve the request and update the user's role to 'worker'
    user.update_user_role_to_worker(db, user_id)
    return {"detail": "Worker request approved, user role updated to 'worker'"}



# Function to create JWT access token
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)):
    if data.get('role') == 'admin':
        expires_delta = timedelta(hours=2)  # Longer expiration for admin
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt



