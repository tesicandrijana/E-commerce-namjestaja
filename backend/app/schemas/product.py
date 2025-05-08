from pydantic import BaseModel
from typing import Optional


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    material_id: int
    length: int
    width: int
    height: int
    price: float
    quantity: Optional[int] = 1
    category_id: int
    images: Optional[list[str]] | None 


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True
