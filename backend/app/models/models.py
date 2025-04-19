from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

# Models using SQLModel

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
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


class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(sa_column_kwargs={"nullable": False, "unique": True})

    products: List["Product"] = Relationship(back_populates="category")


class Product(SQLModel, table=True):
    __tablename__ = "products"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    material: Optional[str] = None
    length: int
    width: int
    height: int
    price: Decimal
    quantity: int = 0
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    image: Optional[str] = None

    category: Optional[Category] = Relationship(back_populates="products")
    discounts: List["Discount"] = Relationship(back_populates="product")
    reviews: List["Review"] = Relationship(back_populates="product")


class Discount(SQLModel, table=True):
    __tablename__ = "discounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    amount: Decimal
    start_date: date
    end_date: date

    product: Optional[Product] = Relationship(back_populates="discounts")


class Order(SQLModel, table=True):
    __tablename__ = "orders"

    id: Optional[int] = Field(default=None, primary_key=True)
    customer_id: int = Field(foreign_key="users.id")
    address: str
    city: str
    postal_code: int
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


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="products.id")
    customer_id: int = Field(foreign_key="users.id")
    rating: int
    comment: Optional[str] = None

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
    user_id: int = Field(foreign_key="user.id")
    desired_role: str = Field(index=True)
    status: str = Field(default="pending")  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)

