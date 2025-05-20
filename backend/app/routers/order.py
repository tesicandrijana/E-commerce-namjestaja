from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import order as order_crud
from app.schemas import order as order_schema
from app.dependencies import get_db, get_current_user
from app.models.models import User  # If your current_user depends on User model

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
)

@router.post("/", response_model=order_schema.Order)
def create_order(
    order_data: order_schema.OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new order for the current logged-in user.
    """
    created_order = order_crud.create_order(
        db,
        user_id=current_user.id,
        product_id=order_data.product_id,
        quantity=order_data.quantity,
    )
    if not created_order:
        raise HTTPException(status_code=400, detail="Order creation failed")
    return created_order


@router.get("/", response_model=List[order_schema.Order])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List orders of the current user.
    """
    return order_crud.get_orders_by_user(db, user_id=current_user.id, skip=skip, limit=limit)


@router.put("/{order_id}/cancel", response_model=order_schema.Order)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Cancel an order if it belongs to the current user.
    """
    order_to_cancel = order_crud.get_order(db, order_id)
    if not order_to_cancel or order_to_cancel.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    cancelled_order = order_crud.cancel_order(db, order_id)
    return cancelled_order


@router.delete("/cancelled/{order_id}")
def delete_cancelled_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a cancelled order if it belongs to the current user.
    """
    order_to_delete = order_crud.get_order(db, order_id)
    if not order_to_delete or order_to_delete.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    if order_to_delete.status != "cancelled":
        raise HTTPException(status_code=400, detail="Order is not cancelled")
    return order_crud.delete_cancelled_order(db, order_id)
