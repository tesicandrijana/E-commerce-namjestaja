from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session
from typing import List, Annotated
from app.services import material_service
from app.dependencies import get_db

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

@router.get("/")
def read_materials(    
    session: SessionDep,
    offset: int = 0,
    limit: int = 100,):
    return material_service.get_materials(session)