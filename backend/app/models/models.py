from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import UniqueConstraint
from passlib.context import CryptContext


# Kreiraj instancu CryptContext za hashiranje i verifikaciju lozinke
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Models using SQLModel
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    #username: str
    email: str = Field(unique=True)
    password: str
    role: str = Field(sa_column_kwargs={"nullable": False})
    is_active: bool = Field(default=True)
    phone: Optional[str] = None
    address: Optional[str] = None

    orders: List["Order"] = Relationship(back_populates="customer")
    reviews: List["Review"] = Relationship(back_populates="customer")
    deliveries: List["Delivery"] = Relationship(back_populates="delivery_person")
    messages_sent: List["Message"] = Relationship(back_populates="sender", sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"})
    messages_received: List["Message"] = Relationship(back_populates="receiver", sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"})
    cart_items: List["CartItem"] = Relationship(back_populates="user")


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"nullable": False, "unique": True})

    products: List["Product"] = Relationship(back_populates="category")

class Material(SQLModel, table=True):
    __tablename__ = "materials"
    id: int = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"nullable": False, "unique": True})

    products: List["Product"] = Relationship(back_populates="material")

class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    material_id: Optional[int] = Field(default=None, foreign_key="materials.id")
    length: int
    width: int
    height: int
    price: Decimal
    quantity: int = 0
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    image: Optional[str] = None

    material: Optional[Material] = Relationship(back_populates="products")
    category: Optional[Category] = Relationship(back_populates="products")
    discounts: List["Discounts"] = Relationship(back_populates="product")
    reviews: List["Review"] = Relationship(back_populates="product")
    cart_items: List["CartItem"] = Relationship(back_populates="product")
    images: List["ProductImage"] = Relationship(back_populates="product", sa_relationship_kwargs={"cascade": "all, delete"})
    order_items: List["OrderItem"] = Relationship(back_populates="product")


class ProductImage(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    image_url: str 

    product: Product = Relationship(back_populates="images")


class Discounts(SQLModel, table=True):
    __tablename__ = "discounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    amount: Decimal
    start_date: date
    end_date: date

    product: Optional["Product"] = Relationship(back_populates="discounts")

class CartItem(SQLModel, table=True):
    __tablename__ = "cart_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    product_id: int = Field(foreign_key="products.id", sa_column_kwargs={"nullable": False})

    quantity: int
    added_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="cart_items")
    product: Optional[Product] = Relationship(back_populates="cart_items")


class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="users.id")
    address: str
    city: str
    postal_code: str
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)
    status: str = Field(default="pending")
    payment_method: str = Field(default="cash")
    payment_status: str = Field(default="pending")
    transaction_id: Optional[str] = None
    total_price: Optional[Decimal] = None

    customer: Optional[User] = Relationship(back_populates="orders")
    items: List["OrderItem"] = Relationship(back_populates="order")


class OrderItem(SQLModel, table=True):
    __tablename__ = "order_items"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id")
    product_id: int = Field(foreign_key="products.id")
    quantity: int
    price_per_unit: Decimal

    order: Optional[Order] = Relationship(back_populates="items")
    product: Optional[Product] = Relationship(back_populates="order_items")



class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    customer_id: int = Field(foreign_key="users.id")
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    product: Optional[Product] = Relationship(back_populates="reviews")
    customer: Optional[User] = Relationship(back_populates="reviews")


class Delivery(SQLModel, table=True):
    __tablename__ = "deliveries"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id")
    delivery_person_id: int = Field(foreign_key="users.id")
    status: str = Field(default="in_progress")
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)

    order: Optional[Order] = Relationship()
    delivery_person: Optional[User] = Relationship(back_populates="deliveries")


class Complaint(SQLModel, table=True):
    __tablename__ = "complaints"

    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="orders.id")
    description: str
    status: str = Field(default="open")
    complaint_type: str = Field(default="complaint")  
    response_text: Optional[str] = None  #DODANO POLJE

    order: Optional[Order] = Relationship()


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="users.id")
    receiver_id: int = Field(foreign_key="users.id")
    content: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)

    sender: Optional[User] = Relationship(back_populates="messages_sent", sa_relationship_kwargs={"foreign_keys": "[Message.sender_id]"})
    receiver: Optional[User] = Relationship(back_populates="messages_received", sa_relationship_kwargs={"foreign_keys": "[Message.receiver_id]"})


class WorkerRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    desired_role: str = Field(index=True)
    status: str = Field(default="pending")  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RegionRate(SQLModel, table=True):
    __tablename__ = "region_rates"

    id: Optional[int] = Field(default=None, primary_key=True)
    country: str  # Optional: 'Germany', 'France' etc.
    city: Optional[str] = None
    postal_code: Optional[str] = None
    tax_rate: Decimal = Field(default=0.0)  # e.g., 0.19 for 19%
    shipping_cost: Decimal = Field(default=0.0)

class ShippingZone(SQLModel, table=True):
    __tablename__ = "shipping_zones"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str  # e.g., "Central Europe", "Eastern Europe"
    countries: str  # comma-separated ISO codes, e.g., "DE,AT,CH"
    base_cost: Decimal

class TaxRate(SQLModel, table=True):
    __tablename__ = "tax_rates"

    id: Optional[int] = Field(default=None, primary_key=True)
    country_code: str = Field(max_length=2, unique=True)# e.g., "DE", "FR"
    vat_rate: Decimal  # e.g., 0.19
    effective_from: date

class PostalCode(SQLModel, table=True):
    __tablename__ = "postal_codes"

    id: Optional[int] = Field(default=None, primary_key=True)
    country_code: str = Field(max_length=2, foreign_key="country_calling_codes.country_code")
    postal_code: str = Field(max_length=10)
    city: str = Field(max_length=100)

    calling_code: Optional["CountryCallingCode"] = Relationship(back_populates="postal_codes")


class CountryCallingCode(SQLModel, table=True):
    __tablename__ = "country_calling_codes"

    id: Optional[int] = Field(default=None, primary_key=True)
    country_code: str = Field(max_length=2, unique=True)
    calling_code: str

    postal_codes: list[PostalCode] = Relationship(back_populates="calling_code")

class AllowedCity(SQLModel, table=True):
    __tablename__ = "allowed_cities"

    id: Optional[int] = Field(default=None, primary_key=True)
    country_code: str  # e.g. 'DE', 'FR'
    city: str          # e.g. 'Berlin', 'Paris'