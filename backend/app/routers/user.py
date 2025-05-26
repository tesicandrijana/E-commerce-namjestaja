from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated
from datetime import timedelta, datetime
from sqlmodel import Field, Session as SQLSession, SQLModel, create_engine, select
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import func
from app.services import user_service
from app.database import get_db
from app.schemas.user import Token, UserCreate, UserSchema, UserUpdate, LoginWithRole
from app.services.user_service import hash_password, validate_password_strength,signup_user
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


# Model za bulk restore korisnika
class UserIdsRequest(BaseModel):
    user_ids: List[int]


# Signup (Only 'customer' role allowed)
@router.post("/signup", response_model=UserSchema)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    return user_service.signup_user(db, user_create)


# Login
@router.post("/login")
def login_for_access_token(session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    login_data = {
        "email": form_data.username,
        "password": form_data.password
    }
    return user_service.login_for_access_token(session, login_data)


@router.get("/employees", response_model=List[UserSchema])
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"])),
    offset: int = 0,
    limit: int = 100,
):
    users = (
        db.query(User)
        .filter(User.is_active == True, User.role != "customer")
        .offset(offset)
        .limit(limit)
        .all()
    )

    if not users:
        raise HTTPException(status_code=404, detail="No active employees found")

    return users


@router.put("/{user_id}", response_model=UserSchema)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    db_user = user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.password:
        validate_password_strength(user_update.password)
        user_update.password = user_service.hash_password(user_update.password)

    updated_user = user.update_user(db, user_id, user_update.dict(exclude_unset=True))

    return updated_user


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    db_user = user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.delete_user(db, user_id)
    return None


@router.get("/count-by-role")
def count_users_by_role(
    db: Session = Depends(get_db), 
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    role_counts = (
        db.query(User.role, func.count(User.id))
        .filter(User.role != "customer")  # isključi korisnike s rolom 'customer'
        .group_by(User.role)
        .all()
    )
    return {role: count for role, count in role_counts}


@router.get("/archived-users", response_model=List[UserSchema])
def get_archived_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    archived_users = db.query(User).filter(User.is_active == False).all()

    if not archived_users:
        raise HTTPException(status_code=404, detail="No archived users found")

    return archived_users


# Endpoint za bulk restore korisnika
@router.post("/restore-users")
def restore_users(
    request: UserIdsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    users = db.query(User).filter(User.id.in_(request.user_ids)).all()

    if not users:
        raise HTTPException(status_code=404, detail="No users found with given IDs")

    not_archived = [u.id for u in users if u.is_active]
    if not_archived:
        raise HTTPException(
            status_code=400,
            detail=f"Users with IDs {not_archived} are already active"
        )

    for user in users:
        user.is_active = True

    db.commit()

    return {"detail": f"{len(users)} users restored successfully"}


@router.get("/restore/{user_id}")
def restore_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already active")

    user.is_active = True
    db.commit()
    db.refresh(user)
    return {"detail": f"User with ID {user_id} restored successfully"}

@router.put("/{user_id}/archive", response_model=UserSchema)
def archive_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    db_user = user.get_user_by_id(db, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not db_user.is_active:
        raise HTTPException(status_code=400, detail="User is already archived")

    db_user.is_active = False
    db.commit()
    db.refresh(db_user)

    return db_user


@router.get("/me")
async def read_users_me(session: SessionDep, current_user: Annotated[User, Depends(user_service.get_current_user)]):
    return current_user


# Customers can request to become workers
@router.post("/request-worker/{desired_role}")
def request_worker_access(
    desired_role: str,
    current_user: User = Depends(user_service.get_current_user),
    db: Session = Depends(get_db)
):
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
def approve_worker_request(
    user_id: int,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
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


@router.get("/admin/stats")
def get_admin_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["customer"]))
):
    return {
        "users": get_user_stats(db),
        "sales": get_sales_stats(db),
        "ratings": get_rating_stats(db),
    }
