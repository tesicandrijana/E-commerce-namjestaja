from pydantic import BaseModel
from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime
from app.schemas import order as order_schema
from app.models.models import Order


class DeliveryBase(BaseModel):
    order_id: int
    delivery_person_id: int | None = None
    status: Optional[str] = "in_progress"

class DeliveryCreate(DeliveryBase):
    pass

class Delivery(DeliveryBase):
    id: int
    date: Optional[datetime]

    class Config:
        from_attributes = True

class DeliveryIncludingOrder(SQLModel):
    id:int
    order_id: int
    delivery_person_id: int |None = None
    status: str
    order: Optional[order_schema.OrderRead]

class DeliveriesAndOrders(SQLModel):
    orders: list[order_schema.OrderRead]
    deliveries: list[DeliveryIncludingOrder]