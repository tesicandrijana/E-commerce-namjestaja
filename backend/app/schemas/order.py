# schemas/order.py
from typing import Optional, List
from sqlmodel import SQLModel, Field
from datetime import datetime
from decimal import Decimal
from .order_item import OrderItemCreate, OrderItemRead


class OrderBase(SQLModel):
    customer_id: int
    address: str
    city: str
    postal_code: int
    status: Optional[str] = "pending"
    payment_method: Optional[str] = "cash"
    payment_status: Optional[str] = "pending"
    transaction_id: Optional[str] = None
    total_price: Optional[Decimal] = None


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderRead(OrderBase):
    id: int
    date: datetime
    items: List[OrderItemRead] = []

    class Config:
        orm_mode = True


class OrderUpdate(SQLModel):
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[int] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    total_price: Optional[Decimal] = None
