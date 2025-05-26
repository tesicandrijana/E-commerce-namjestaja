from typing import Optional, List
from decimal import Decimal
from sqlmodel import SQLModel, Field
from app.schemas import product_image

class CategoryRead(SQLModel):
    id: int
    name: str

    class Config:
        orm_mode = True

class ProductBase(SQLModel):
    name: str
    description: Optional[str] = None
    material_id: Optional[int] = None
    length: int
    width: int
    height: int
    price: Decimal
    quantity: int = 0
    category_id: Optional[int] = None
    images: Optional[list[product_image.ProductImageBase]] | None = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    material_id: Optional[int] = None
    length: Optional[int] = None
    width: Optional[int] = None
    height: Optional[int] = None
    price: Optional[Decimal] = None
    quantity: Optional[int] = None
    category_id: Optional[int] = None
    images: Optional[list[product_image.ProductImageBase]] | None = None

class ProductRead(ProductBase):
    id: int
    category: Optional[CategoryRead] = None  

    class Config:
        orm_mode = True

class DeleteResponse(SQLModel):
    detail: str

class RestockRequest(SQLModel):
    added: int