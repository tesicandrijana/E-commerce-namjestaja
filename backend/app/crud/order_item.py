# crud/order_item.py
from sqlalchemy.orm import Session
from app.models.models import OrderItem
from app.schemas.order_item import OrderItemCreate

def create_order_item(db: Session, order_item: OrderItemCreate):
    db_order_item = OrderItem(**order_item.dict())
    db.add(db_order_item)
    db.commit()
    db.refresh(db_order_item)
    return db_order_item

def get_order_items(db: Session):
    return db.query(OrderItem).all()

def update_order_item(db: Session, order_item_id: int, updates: dict):
    db.query(OrderItem).filter(OrderItem.id == order_item_id).update(updates)
    db.commit()

def delete_order_item(db: Session, order_item_id: int):
    item = db.query(OrderItem).get(order_item_id)
    db.delete(item)
    db.commit()
    return item