from pydantic import BaseModel
from datetime import date

class DiscountBase(BaseModel):
    product_id: int
    amount: float
    start_date: date
    end_date: date

class DiscountCreate(DiscountBase):
    pass

class Discount(DiscountBase):
    id: int

    class Config:
        from_attributes = True
