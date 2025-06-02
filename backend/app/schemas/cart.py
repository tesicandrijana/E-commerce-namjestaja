from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field
from app.schemas.product import ProductRead


class CartItemCreate(SQLModel):
    product_id: int
    quantity: int


class CartItemUpdate(SQLModel):
    quantity: int

class CartItemRead(SQLModel):
    id: int
    user_id: int
    product_id: int
    quantity: int
    added_at: Optional[datetime]

    product: Optional[ProductRead]

    @property
    def total_price(self) -> Optional[float]:
        if self.product:
            return self.quantity * float(self.product.price)
        return None

    class Config:
        orm_mode = True
