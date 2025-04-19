from fastapi import APIRouter, Depends, HTTPException 
from sqlalchemy.orm import Session
from typing import List

from app.crud import category  # 
from app.schemas import category as category_schema
from app.dependencies import get_db

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=category_schema.Category)
def create_category(category_data: category_schema.CategoryCreate, db: Session = Depends(get_db)):
    db_category = category.get_category_by_name(db, category_data.name)
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    return category.create_category(db, category_data)


@router.get("/", response_model=List[category_schema.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return category.get_categories(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=category_schema.Category)
def read_category(category_id: int, db: Session = Depends(get_db)):
    db_category = category.get_category(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    return category.delete_category(db, category_id)
