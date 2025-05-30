from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ComplaintBase(BaseModel):
    order_id: int
    description: str
    status: Optional[str] = "open"
    preferred_resolution: Optional[str] = None  # return, refund, repair

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
    
class ComplaintResponse(BaseModel):
    response_text: str


