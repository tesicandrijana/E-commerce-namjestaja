from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeliveryBase(BaseModel):
    order_id: int
    delivery_person_id: int
    status: Optional[str] = "in_progress"

class DeliveryCreate(DeliveryBase):
    pass

class Delivery(DeliveryBase):
    id: int
    date: Optional[datetime]

    class Config:
        orm_mode = True
