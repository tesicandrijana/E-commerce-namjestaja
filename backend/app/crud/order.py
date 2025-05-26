# crud/order.py
from sqlmodel import Session, select
from app.models.models import Order, OrderItem
from app.schemas.order import OrderCreate, OrderUpdate
from typing import List, Optional
from decimal import Decimal
from fastapi import HTTPException


def create_order(order_data: OrderCreate, session: Session) -> Order:
    # Calculate total price
    total_price = sum(item.quantity * item.price_per_unit for item in order_data.items)

    # Create the order
    order = Order(
        customer_id=order_data.customer_id,
        address=order_data.address,
        city=order_data.city,
        postal_code=order_data.postal_code,
        total_price=total_price,
        status=order_data.status,
        payment_method=order_data.payment_method,
        payment_status=order_data.payment_status,
        transaction_id=order_data.transaction_id,
    )
    session.add(order)
    session.commit()
    session.refresh(order)

    # Create order items
    for item in order_data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_per_unit=item.price_per_unit
        )
        session.add(order_item)

    session.commit()
    session.refresh(order)
    return order


def get_orders(session: Session) -> List[Order]:
    statement = select(Order)
    return session.exec(statement).all()


def get_order_by_id(order_id: int, session: Session) -> Optional[Order]:
    return session.get(Order, order_id)


def update_order(order_id: int, updates: OrderUpdate, session: Session) -> Optional[Order]:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)

    session.add(order)
    session.commit()
    session.refresh(order)
    return order


def delete_order(order_id: int, session: Session) -> bool:
    order = session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    session.delete(order)
    session.commit()
    return True
