from sqlalchemy.orm import Session
from sqlmodel import select
from datetime import datetime
from app.models.models import CartItem
from app.schemas.cart import CartItemCreate, CartItemUpdate


def get_cart_items(db: Session, user_id: int):
    statement = select(CartItem).where(CartItem.user_id == user_id)
    return db.exec(statement).all()


def get_cart_item_by_id(db: Session, user_id: int, item_id: int):
    statement = select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    return db.exec(statement).first()


def add_cart_item(db: Session, user_id: int, item: CartItemCreate):
    statement = select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == item.product_id)
    existing_item = db.exec(statement).first()

    if existing_item:
        # Optional: prevent negative or zero quantity
        if item.quantity <= 0:
            # You may want to raise an exception or handle differently
            return None

        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item

    if item.quantity <= 0:
        # Don't add item with zero or negative quantity
        return None

    cart_item = CartItem(
        user_id=user_id,
        product_id=item.product_id,
        quantity=item.quantity,
        added_at=datetime.utcnow()
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


def update_cart_item(db: Session, user_id: int, item_id: int, item: CartItemUpdate):
    cart_item = get_cart_item_by_id(db, user_id, item_id)
    if not cart_item:
        return None

    if item.quantity is not None:
        if item.quantity <= 0:
            # Optional: delete if quantity <= 0 or reject update
            db.delete(cart_item)
            db.commit()
            return None

        cart_item.quantity = item.quantity

    db.commit()
    db.refresh(cart_item)
    return cart_item



def delete_cart_item(db: Session, user_id: int, item_id: int):
    cart_item = get_cart_item_by_id(db, user_id, item_id)
    if not cart_item:
        return False

    db.delete(cart_item)
    db.commit()
    return True
