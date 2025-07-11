# crud/discount.py
from sqlmodel import Session, select
from app.models.models import Discounts
from app.schemas.discount import DiscountCreate
from datetime import date
from decimal import Decimal

def get_discounts(db: Session, skip: int = 0, limit: int = 100):
    try:
        return db.query(Discounts).offset(skip).limit(limit).all()
    except Exception as e:
        print(f"DB error in get_discounts: {e}")
        raise

def create_discount(db: Session, discount: DiscountCreate):
    db_discount = Discounts(**discount.dict())
    db.add(db_discount)
    db.commit()
    db.refresh(db_discount)
    return db_discount

def get_discounts(db: Session):
    return db.query(Discounts).all()

def update_discount(db: Session, discount_id: int, updates: dict):
    db.query(Discounts).filter(Discounts.id == discount_id).update(updates)
    db.commit()

def delete_discount(db: Session, discount_id: int):
    discount = db.query(Discounts).get(discount_id)
    db.delete(discount)
    db.commit()
    return discount