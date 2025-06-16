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
        from_attributes = True

class DeliveryPersonProfile(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    about: Optional[str] = None
    role: str

    class Config:
        from_attributes = True

class DeliveryPersonUpdate(BaseModel):
    name: Optional[str]
    phone: Optional[str]
    about: Optional[str]
