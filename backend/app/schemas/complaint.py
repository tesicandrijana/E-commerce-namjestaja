from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintBase(BaseModel):
    order_id: int
    description: str
    status: Optional[str] = "open"
    preferred_resolution: Optional[str] = None  # return, refund, repair
    assigned_to: Optional[int] = None

class ComplaintCreate(ComplaintBase):
    pass

class Complaint(ComplaintBase):
    id: int
    final_resolution: Optional[str] = None
    response_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ComplaintUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None  # open, in_progress, resolved
    final_resolution: Optional[str] = None
    assigned_to: Optional[int] = None
    
class ComplaintResponse(BaseModel):
    response_text: str


class ComplaintWithCustomer(BaseModel):
    id: int
    description: str
    status: str
    preferred_resolution: Optional[str]
    final_resolution: Optional[str]
    assigned_to: Optional[int]
    response_text: Optional[str] = None
    created_at: datetime
    order_id: int
    customer_name: str  # ime korisnika iz narudžbe

    class Config:
        from_attributes = True


