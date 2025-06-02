# app/routers/discount.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel  import Session
from typing import List, Annotated
from app.crud import discount
from app.schemas import discount as discount_schema
from app.services import discount_service
from app.dependencies import get_db

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/")
def create_discounts(session: SessionDep, discount_data: list[discount_schema.DiscountCreate]):
    return discount_service.create_discounts(session, discount_data)


@router.get("/", response_model=List[discount_schema.Discount])
def read_discounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return discount.get_discounts(db, skip=skip, limit=limit)
