# crud/order.py
from sqlalchemy.orm import Session
from app.models.models import Order
from app.schemas.order import OrderCreate
from fastapi import HTTPException


def create_order(db: Session, order: OrderCreate):
    db_order = Order(**order.dict())
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

def get_orders(db: Session):
    return db.query(Order).all()

def update_order(db: Session, order_id: int, updates: dict):
    db.query(Order).filter(Order.id == order_id).update(updates)
    db.commit()


def cancel_order(db: Session, order_id: int):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    if order.status not in ["pending", "preparing"]:
        raise HTTPException(status_code=400, detail="Only pending or preparing orders can be cancelled")
    
    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return order


def delete_cancelled_order(db: Session, order_id: int):
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    if db_order.status != "cancelled":
        raise HTTPException(status_code=400, detail="Only cancelled orders can be deleted")
    db.delete(db_order)
    db.commit()
    return {"message": "Cancelled order deleted successfully"}
