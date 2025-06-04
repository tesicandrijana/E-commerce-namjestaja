from typing import Optional
from sqlmodel import SQLModel, Field
from decimal import Decimal
from datetime import datetime

class ProductImageBase(SQLModel):
    image_url: str
    product_id: int

    class Config:
        from_attributes = True

class ProductImageCreate(ProductImageBase):
    pass


class ProductImageRead(SQLModel):
    id: int = Field(primary_key=True)
    image_url: str

class ProductImageUpdate(SQLModel):
    url: Optional[str] = None

class ProductRead(SQLModel):
    id: int = Field(primary_key=True)
    name: str
    price: Decimal
    image: Optional[ProductImageRead] = None  # first image


class CartItemWithImageRead(SQLModel):
    id: int = Field(primary_key=True)
    product_id: int
    quantity: int
    added_at: datetime
    product: Optional[ProductRead] = None