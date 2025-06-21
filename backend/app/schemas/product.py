from typing import Optional, List
from decimal import Decimal
from datetime import datetime
from sqlmodel import SQLModel, Field
from app.schemas import product_image

class ProductBulkDeleteReq(SQLModel):
    ids: list[int]

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


class ManagerProductResponse(SQLModel):
    id: int
    name: str
    price:Decimal
    quantity :int
    order_count: int
    rating: Decimal | None
    active_discount: int
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


class DiscountRead(SQLModel):
    id: int
    amount: float  
    product_id: int

class ProductRead(ProductBase):
    id: int
    category: Optional[CategoryRead] = None
    discount: Optional[DiscountRead] = None
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class DeleteResponse(SQLModel):
    detail: str

class RestockRequest(SQLModel):
    added: int