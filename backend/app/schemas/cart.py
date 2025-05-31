from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field


class CartItemBase(SQLModel):
    product_id: int
    quantity: int


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(SQLModel):
    quantity: int

class CartItemRead(SQLModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    added_at: Optional[datetime]

    class Config:
        orm_mode = True
