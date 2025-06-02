from sqlmodel import SQLModel, Field
from datetime import date
from typing import Optional

class DiscountBase(SQLModel):
    product_id: int
    amount: float
    start_date: date
    end_date: date

class DiscountCreate(DiscountBase):
    pass

class Discount(DiscountBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
