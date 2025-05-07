from typing import Annotated,Literal, List
from fastapi import Depends
from sqlmodel import Session
from app.models.models import Category
from app.repositories import category_repository
from fastapi import HTTPException
from app.database import get_db


def get_categories(session: Session, offset: int = 0, limit: int = 100) -> list[Category]:
    return category_repository.get_categories(session, offset, limit)