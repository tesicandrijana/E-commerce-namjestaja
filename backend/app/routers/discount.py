# app/routers/discount.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import discount
from app.schemas import discount as discount_schema
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=discount_schema.Discount)
def create_discount(discount_data: discount_schema.DiscountCreate, db: Session = Depends(get_db)):
    return discount.create_discount(db, discount_data)

@router.get("/", response_model=List[discount_schema.Discount])
def read_discounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return discount.get_discounts(db, skip=skip, limit=limit)
