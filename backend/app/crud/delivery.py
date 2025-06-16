from sqlalchemy.orm import Session
from app.models.models import Delivery
from app.schemas.delivery import DeliveryCreate

def create_delivery(db: Session, delivery: DeliveryCreate):
    db_delivery = Delivery(**delivery.dict())
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    return db_delivery

def get_deliveries(db: Session):
    return db.query(Delivery).all()

def get_delivery(db: Session, delivery_id: int):
    return db.query(Delivery).get(delivery_id)


def update_delivery(db: Session, delivery_id: int, updates: dict):
    db.query(Delivery).filter(Delivery.id == delivery_id).update(updates)
    db.commit()

def delete_delivery(db: Session, delivery_id: int):
    delivery = db.query(Delivery).get(delivery_id)
    db.delete(delivery)
    db.commit()
    return delivery

def update_delivery_status(db: Session, delivery_id: int, new_status: str):
    db_delivery = db.query(Delivery).get(delivery_id)
    if not db_delivery:
        return None
    db_delivery.status = new_status
    db.commit()
    db.refresh(db_delivery)
    return db_delivery
