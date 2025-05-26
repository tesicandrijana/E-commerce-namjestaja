from typing import Optional
from sqlmodel import SQLModel, Field

class ProductImageBase(SQLModel):
    image_url: str
    product_id: int

    class Config:
        from_attributes = True

class ProductImageCreate(ProductImageBase):
    pass

class ProductImageRead(ProductImageBase):
    id: int

class ProductImageUpdate(SQLModel):
    url: Optional[str] = None

