from decimal import Decimal
from sqlmodel import SQLModel, Field
from datetime import date
from app.models.models import Product

class DiscountBase(SQLModel):
    product_id: int
    amount: Decimal = Field(ge=0)
    start_date: date
    end_date: date
    
class DiscountCreate(DiscountBase):
    pass

class DiscountUpdate(SQLModel):
    product_id: int | None = None
    amount: int | None = None
    start_date: date | None = None
    end_date: date | None = None


class Discount(DiscountBase):
    id: int
    product: Product

    class Config:
        from_attributes = True

class ReadDiscountsResponse(SQLModel):
    discounts: list[Discount]
    count: int
    

