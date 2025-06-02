from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.database import get_db

from app.models.models import User, Order, OrderItem, Product
from app.dependencies import get_db  
from app.services.user_service import role_check
from typing import List, Annotated, Optional

router = APIRouter()
SessionDep=Annotated[Session, Depends(get_db)]


# prikaz narudzbi kupaca
@router.get("/support/orders")
def get_all_orders(
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    orders = session.exec(select(Order)).all()

    return [
        {
            "id": order.id,
            "status": order.status,
            "total_price": order.total_price,
            "created_at": order.date,
            "customer": {
                "id": order.customer.id,
                "name": order.customer.name,
                "email": order.customer.email
            }
        }
        for order in orders if order.customer
    ]


#prikaz pojedinacne narudzbe
@router.get("/support/orders/{order_id}")
def get_order_by_id(
    order_id : int,
    session: SessionDep,
    current_user: User=Depends(role_check(["support"]))
):
    order = session.exec(select(Order)
    .options(
        selectinload(Order.customer),
        selectinload(Order.items).selectinload(OrderItem.product)
    )
    .where(Order.id == order_id)
    ).first()


    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "id": order.id,
        "status": order.status,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "transaction_id": order.transaction_id,
        "total_price": float(order.total_price or 0),
        "created_at": order.date,
        "address": order.address,
        "city": order.city,
        "postal_code": order.postal_code,
        "customer": {
            "id": order.customer.id,
            "name": order.customer.name,
            "email": order.customer.email,
            "phone": order.customer.phone,
            "address": order.customer.address
        },
        "items": [
            {
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "N/A",
                "quantity": item.quantity,
                "price_per_unit": float(item.price_per_unit),
                "total": float(item.price_per_unit * item.quantity),
            }
            for item in order.items
        ]
    }