from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session
from app.schemas.order_item import OrderItemCreate, OrderItemRead, OrderItemUpdate
from app.crud.order_item import create_order_item, get_order_items, get_order_item_by_id, update_order_item, delete_order_item
from app.database import get_session

router = APIRouter()

@router.post("/", response_model=OrderItemRead, status_code=status.HTTP_201_CREATED)
def create_new_order_item(order_item: OrderItemCreate, session: Session = Depends(get_session)):
    return create_order_item(order_item, session)

@router.get("/", response_model=List[OrderItemRead])
def read_order_items(session: Session = Depends(get_session)):
    return get_order_items(session)

@router.get("/{order_item_id}", response_model=OrderItemRead)
def read_order_item(order_item_id: int, session: Session = Depends(get_session)):
    order_item = get_order_item_by_id(order_item_id, session)
    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return order_item

@router.put("/{order_item_id}", response_model=OrderItemRead)
def update_existing_order_item(order_item_id: int, updates: OrderItemUpdate, session: Session = Depends(get_session)):
    return update_order_item(order_item_id, updates, session)

@router.delete("/{order_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_order_item(order_item_id: int, session: Session = Depends(get_session)):
    success = delete_order_item(order_item_id, session)
    if not success:
        raise HTTPException(status_code=404, detail="Order item not found")
