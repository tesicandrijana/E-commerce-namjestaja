from typing import Annotated,Literal, List
from fastapi import Depends
from sqlmodel import Session
from app.models.models import Material
from app.repositories import material_repository
from fastapi import HTTPException


def get_materials(session: Session, offset: int = 0, limit: int = 100) -> list[Material]:
    return material_repository.get_materials(session, offset, limit)