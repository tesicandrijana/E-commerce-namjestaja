from pydantic import Field
from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime


class ReviewCreate(SQLModel):
    product_id: int
    rating: int   
    comment: str

class ReviewUpdate(SQLModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewRead(SQLModel):
    id: int
    product_id: int
    customer_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    customer_name: str  


class ReviewOut(SQLModel):
    id: int
    product_id: int
    customer_id: int
    rating: int
    comment: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True