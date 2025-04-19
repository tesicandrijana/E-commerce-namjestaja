from sqlalchemy import Column, Integer, String, Text, Boolean, Date, ForeignKey, Numeric, CheckConstraint, TIMESTAMP
from sqlalchemy.orm import relationship
from app.database import Base

# Consolidated models for the furniture store

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True)
    password = Column(Text, nullable=False)
    role = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    phone = Column(Text)
    address = Column(Text)

    __table_args__ = (
        CheckConstraint("role IN ('administrator','manager','customer','support','delivery')", name="check_user_role"),
    )

    # Relationships
    orders = relationship("Order", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")
    deliveries = relationship("Delivery", back_populates="delivery_person")
    messages_sent = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True)
    name = Column(Text, unique=True, nullable=False)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(Text, nullable=False)
    description = Column(Text)
    material = Column(Text)
    length = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=0)
    category_id = Column(Integer, ForeignKey("categories.id"))
    image = Column(Text)

    category = relationship("Category", back_populates="products")
    discounts = relationship("Discount", back_populates="product")
    reviews = relationship("Review", back_populates="product")

class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    amount = Column(Numeric(5, 2), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    product = relationship("Product", back_populates="discounts")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(Text, nullable=False)
    postal_code = Column(Integer, nullable=False)
    date = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")
    status = Column(Text, default="pending")
    payment_method = Column(Text, default="cash", nullable=False)
    payment_status = Column(Text, default="pending")
    transaction_id = Column(Text)
    total_price = Column(Numeric(10, 2))

    __table_args__ = (
        CheckConstraint("status IN ('pending','preparing','shipping','delivered','cancelled')", name="check_order_status"),
        CheckConstraint("payment_method IN ('cash','card')", name="check_payment_method"),
    )

    customer = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_unit = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text)

    __table_args__ = (
        CheckConstraint("rating BETWEEN 1 AND 5", name="check_review_rating"),
    )

    product = relationship("Product", back_populates="reviews")
    customer = relationship("User", back_populates="reviews")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    delivery_person_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(Text, default="in_progress")
    date = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    __table_args__ = (
        CheckConstraint("status IN ('in_progress','delivered')", name="check_delivery_status"),
    )

    order = relationship("Order")
    delivery_person = relationship("User", back_populates="deliveries")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Text, default="open")

    __table_args__ = (
        CheckConstraint("status IN ('open','resolved')", name="check_complaint_status"),
    )

    order = relationship("Order")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")

    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="messages_received")

class WorkerRequest(Base):
    __tablename__ = "worker_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    status = Column(String, default="pending", nullable=False)

    user = relationship("User")
