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
    postal_code: str
    # REMOVE country_code, subtotal, discount_total, tax, shipping_cost
    status: Optional[str]
    payment_method: Optional[str]
    payment_status: Optional[str]
    transaction_id: Optional[str]
    total_price: Decimal  # required here, not optional
    items: List[OrderItemCreate]


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderRead(OrderBase):
    id: int
    date: datetime
    items: List[OrderItemRead] = []

    class Config:
        orm_mode = True
        json_encoders = {
            Decimal: lambda v: float(v),
        }


class OrderUpdate(SQLModel):
    address: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    transaction_id: Optional[str] = None
    total_price: Optional[Decimal] = None


class OrderItemInput(SQLModel):
    product_id: int
    quantity: int

class PriceCalculationRequest(SQLModel):
    items: List[OrderItemInput]
    country: str
    region: str
    postal_code: Optional[str] = None
    discount_code: Optional[str] = None

class PriceCalculationResponse(SQLModel):
    subtotal: float
    tax: float
    shipping: float
    discount: float
    total: float    
