from typing import Optional
from sqlmodel import SQLModel, Field

class ProductImageBase(SQLModel):
    url: str
    product_id: int

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageRead(ProductImageBase):
    id: int

class ProductImageUpdate(SQLModel):
    url: Optional[str] = None

class Config:
    from_attributes = True
