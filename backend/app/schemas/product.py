from pydantic import BaseModel
from typing import Optional


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    material: Optional[str] = None
    length: int
    width: int
    height: int
    price: float
    quantity: Optional[int] = 0
    category_id: Optional[int] = None
    image: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        orm_mode = True
