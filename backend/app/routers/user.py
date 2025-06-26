from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Annotated
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.services import user_service
from app.database import get_db
from app.schemas.user import Token, UserCreate, UserSchema, UserUpdate, UserIdsRequest
from app.dependencies import get_admin_user
from app.repositories import user_repository
from app.models.models import User

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_db)]


@router.post("/signup", response_model=UserSchema)
def signup(user_create: UserCreate, db: Session = Depends(get_db)):
    return user_service.signup_user(db, user_create)


@router.post("/login")
def login_for_access_token(session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response) -> Token:
    return user_service.login_user(session, form_data.username, form_data.password, response)


@router.post("/login/customer")
def login_for_access_token_customer(session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response) -> Token:
    return user_service.login_customer(session, form_data.username, form_data.password, response)


@router.post("/logout")
def logout(response: Response):
    return user_service.logout(response)


@router.get("/employees", response_model=List[UserSchema])
def get_employees(db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"])), offset: int = 0, limit: int = 100):
    return user_repository.get_employees(db, offset, limit)


@router.put("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_service.update_user(db, user_id, user_update)


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    user_repository.delete_user(db, user_id)


@router.get("/count-by-role")
def count_users_by_role(db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_repository.count_users_by_role(db)


@router.get("/archived-users", response_model=List[UserSchema])
def get_archived_users(search: str = '', db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_repository.get_archived_users(db, search)


@router.post("/restore-users")
def restore_users(request: UserIdsRequest, db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_service.restore_users(db, request.user_ids)


@router.get("/restore/{user_id}")
def restore_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_service.restore_user(db, user_id)


@router.put("/{user_id}/archive", response_model=UserSchema)
def archive_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_service.archive_user(db, user_id)


@router.get("/employees/search", response_model=List[UserSchema])
def search_employees(search: str = '', db: Session = Depends(get_db), current_user: User = Depends(user_service.role_check(["admin"]))):
    return user_repository.search_employees(db, search)


@router.get("/me")
async def read_users_me(session: SessionDep, current_user: Annotated[User, Depends(user_service.get_current_user)]):
    return current_user


@router.get("/delivery")
def get_all_delivery(session: SessionDep):
    return user_repository.get_all_delivery(session)
