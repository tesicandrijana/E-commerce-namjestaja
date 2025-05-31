from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlmodel import Session
from app.schemas.order import OrderCreate, OrderRead
from app.crud.order import create_order, get_orders, get_order_by_id, update_order, delete_order
from app.database import get_session

router = APIRouter()

@router.post("/", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_new_order(order: OrderCreate, session: Session = Depends(get_session)):
    return create_order(order, session)

@router.get("/", response_model=List[OrderRead])
def read_orders(session: Session = Depends(get_session)):
    return get_orders(session)

@router.get("/{order_id}", response_model=OrderRead)
def read_order(order_id: int, session: Session = Depends(get_session)):
    order = get_order_by_id(order_id, session)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_order(order_id: int, session: Session = Depends(get_session)):
    success = delete_order(order_id, session)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")

