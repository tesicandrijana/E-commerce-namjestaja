from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    customer_id: int
    address: str
    city: str
    postal_code: int
    status: Optional[str] = "pending"
    payment_method: Optional[str] = "cash"
    payment_status: Optional[str] = "pending"
    transaction_id: Optional[str] = None
    total_price: Optional[float] = None

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    date: Optional[datetime]

    class Config:
        from_attributes = True
