# app/routers/order.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import order
from app.schemas import order as order_schema
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=order_schema.Order)
def create_order(order_data: order_schema.OrderCreate, db: Session = Depends(get_db)):
    return order.create_order(db, order_data)

@router.get("/", response_model=List[order_schema.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return order.get_orders(db, skip=skip, limit=limit)

@router.put("/{order_id}/cancel", response_model=order_schema.Order)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    cancelled = order.cancel_order(db, order_id)
    if not cancelled:
        raise HTTPException(status_code=404, detail="Order not found")
    return cancelled


@router.delete("/cancelled/{order_id}")
def delete_cancelled_order(order_id: int, db: Session = Depends(get_db)):
    return order.delete_cancelled_order(db, order_id)