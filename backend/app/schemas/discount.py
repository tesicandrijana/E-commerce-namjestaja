from typing import Optional, List
from decimal import Decimal
from sqlmodel import SQLModel, Field
from pydantic import field_validator
from datetime import date

class DiscountBase(SQLModel):
    product_id: int
    amount: Decimal = Field(gt=0)
    start_date: date
    end_date: date
    
class DiscountCreate(DiscountBase):
    pass

class Discount(DiscountBase):
    id: int

    class Config:
        from_attributes = True
