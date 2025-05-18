from pydantic import BaseModel
from typing import Optional


class ProductImage(BaseModel):
    id: int
    image_url: str

    class Config:
        from_attributes = True

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
    images: Optional[list[ProductImage]] | None = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True


class RestockRequest(BaseModel):
    added: int