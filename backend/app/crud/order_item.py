# crud/order_item.py
from sqlmodel import Session, select
from app.models.models import OrderItem
from app.schemas.order_item import OrderItemCreate, OrderItemUpdate
from typing import List, Optional
from fastapi import HTTPException


def create_order_item(data: OrderItemCreate, session: Session) -> OrderItem:
    item = OrderItem(**data.dict())
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def get_order_items(session: Session) -> List[OrderItem]:
    statement = select(OrderItem)
    return session.exec(statement).all()


def get_order_item_by_id(order_item_id: int, session: Session) -> Optional[OrderItem]:
    return session.get(OrderItem, order_item_id)


def update_order_item(order_item_id: int, updates: OrderItemUpdate, session: Session) -> Optional[OrderItem]:
    item = session.get(OrderItem, order_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_order_item(order_item_id: int, session: Session) -> bool:
    item = session.get(OrderItem, order_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Order item not found")

    session.delete(item)
    session.commit()
    return True
