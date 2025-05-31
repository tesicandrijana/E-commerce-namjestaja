from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate
from app.database import get_session
from app.crud import category as category_crud

router = APIRouter(tags=["Categories"])

@router.post("/", response_model=CategoryRead)
def create_category(
    category_data: CategoryCreate,
    session: Session = Depends(get_session)
):
    existing = category_crud.get_category_by_name(session, category_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    return category_crud.create_category(session, category_data)


@router.get("/", response_model=List[CategoryRead])
def read_categories(
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    session: Session = Depends(get_session)
):
    return category_crud.get_categories(session, offset, limit)


@router.get("/{category_id}", response_model=CategoryRead)
def read_category(category_id: int, session: Session = Depends(get_session)):
    category = category_crud.get_category(session, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    updates: CategoryUpdate,
    session: Session = Depends(get_session)
):
    updated = category_crud.update_category(session, category_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated


@router.delete("/{category_id}")
def delete_category(category_id: int, session: Session = Depends(get_session)):
    success = category_crud.delete_category(session, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted successfully"}
