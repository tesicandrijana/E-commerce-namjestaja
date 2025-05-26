# schemas/order_item.py
from typing import Optional
from sqlmodel import SQLModel
from decimal import Decimal


class OrderItemBase(SQLModel):
    product_id: int
    quantity: int
    price_per_unit: Decimal


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemRead(OrderItemBase):
    id: int
    order_id: int

    class Config:
        orm_mode = True


class OrderItemUpdate(SQLModel):
    quantity: Optional[int] = None
    price_per_unit: Optional[Decimal] = None
