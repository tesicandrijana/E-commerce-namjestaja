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
        orm_mode = True
