from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.models.models import Discounts
from app.schemas.discount import DiscountCreate
from app.database import get_db
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=Discounts)
def create_discount(discount_data: DiscountCreate, db: Session = Depends(get_db)):
    discount = Discounts.from_orm(discount_data)
    db.add(discount)
    db.commit()
    db.refresh(discount)
    return discount

@router.get("/", response_model=List[Discounts])
def read_discounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    discounts = db.exec(select(Discounts).offset(skip).limit(limit)).all()
    return discounts



