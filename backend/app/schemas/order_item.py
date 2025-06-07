# schemas/order_item.py
from typing import Optional
from sqlmodel import SQLModel
from decimal import Decimal
from sqlmodel import SQLModel, Field
from app.schemas import product_image



class OrderItemBase(SQLModel):
    product_id: int
    quantity: int
    price_per_unit: Decimal


class OrderItemCreate(OrderItemBase):
    pass

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

class OrderItemRead(SQLModel):
    id: int
    product_id: int
    quantity: int
    price_per_unit: Decimal
    product: Optional[ProductBase]


class OrderItemUpdate(SQLModel):
    quantity: Optional[int] = None
    price_per_unit: Optional[Decimal] = None
