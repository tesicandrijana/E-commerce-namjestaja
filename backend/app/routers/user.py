from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Annotated
from datetime import timedelta, datetime
from sqlmodel import Field, Session as SQLSession, SQLModel, create_engine, select
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import func,or_

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
def login_for_access_token(session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response) -> Token:
    login_data = {
        "email": form_data.username,
        "password": form_data.password
    }
    return user_service.login_for_access_token(session, login_data,response)


# Login SAMO ZA CUSTOMERA    -----  CART-ICON IN HEADER
@router.post("/login/customer")
def login_for_access_token_customer(session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response) -> Token:
    login_data = {
        "email": form_data.username,
        "password": form_data.password,
    }
    return user_service.login_for_access_token_customer(session, login_data,response)



@router.post("/logout")
def logout(response: Response):
    return user_service.logout(response)

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
    search: str = '',
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    query = db.query(User).filter(User.is_active == False)
    
    if search:
        search_filter = or_(
            User.name.ilike(f"%{search}%"),
            User.role.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    archived_users = query.all()

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

@router.get("/employees/search", response_model=List[UserSchema])
def search_employees(
    search: str = '',
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.role_check(["admin"]))
):
    if not search:
        return []  # Ako nema unosa, ne vraćaj ništa

    query = db.query(User).filter(
    User.is_active == True,
    User.role != "customer",
    or_(
        User.name.ilike(f"%{search}%"),
        User.role.ilike(f"%{search}%")
    )
)

    return query.limit(10).all()


@router.get("/me")
async def read_users_me(session: SessionDep, current_user: Annotated[User, Depends(user_service.get_current_user)]):
    return current_user

@router.get("/delivery")
def get_all_delivery(session: SessionDep):
    return user_service.get_all_delivery(session)