from pydantic import BaseModel
from typing import Optional

class ComplaintBase(BaseModel):
    order_id: int
    description: str
    status: Optional[str] = "open"

class ComplaintCreate(ComplaintBase):
    pass

class Complaint(ComplaintBase):
    id: int

    class Config:
        from_attributes = True


class ComplaintUpdate(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None  # open, in_progress, resolved
    

class ComplaintResponse(BaseModel):
    response_text: str


