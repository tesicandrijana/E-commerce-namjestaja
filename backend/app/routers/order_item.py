# routers/order_item.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import order_item
from app.schemas import order_item as order_item_schema
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=order_item_schema.OrderItem)
def create_order_item(item: order_item_schema.OrderItemCreate, db: Session = Depends(get_db)):
    return order_item.create_order_item(db, item)

@router.get("/", response_model=List[order_item_schema.OrderItem])
def read_order_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return order_item.get_order_items(db, skip=skip, limit=limit)

@router.get("/{item_id}", response_model=order_item_schema.OrderItem)
def read_order_item(item_id: int, db: Session = Depends(get_db)):
    db_item = order_item.get_order_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return db_item