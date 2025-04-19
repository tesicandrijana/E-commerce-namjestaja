# crud/discount.py
from sqlalchemy.orm import Session
from app.models.models import Discount
from app.schemas.discount import DiscountCreate

def create_discount(db: Session, discount: DiscountCreate):
    db_discount = Discount(**discount.dict())
    db.add(db_discount)
    db.commit()
    db.refresh(db_discount)
    return db_discount

def get_discounts(db: Session):
    return db.query(Discount).all()

def update_discount(db: Session, discount_id: int, updates: dict):
    db.query(Discount).filter(Discount.id == discount_id).update(updates)
    db.commit()

def delete_discount(db: Session, discount_id: int):
    discount = db.query(Discount).get(discount_id)
    db.delete(discount)
    db.commit()
    return discount