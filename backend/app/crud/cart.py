from sqlalchemy.orm import Session
from sqlmodel import select
from datetime import datetime
from app.models.models import CartItem, Product
from sqlalchemy.orm import selectinload
from app.schemas.cart import CartItemUpdate
from fastapi import HTTPException
from app.models.models import CartItem, Product


def get_cart_items(db: Session, user_id: int):
    statement = select(CartItem).where(CartItem.user_id == user_id)
    return db.exec(statement).all()


def get_cart_item_by_id(db: Session, user_id: int, item_id: int):
    statement = select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user_id)
    return db.exec(statement).first()


def add_to_cart(db: Session, user_id: int, product_id: int, quantity: int):
    # Fetch the product
    product = db.exec(select(Product).where(Product.id == product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if product.quantity < quantity:
        raise HTTPException(status_code=400, detail="Not enough stock available.")

    # Check if item already exists in cart
    cart_item = db.exec(
        select(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
    ).first()

    if cart_item:
        new_quantity = cart_item.quantity + quantity
        if product.quantity < new_quantity:
            raise HTTPException(status_code=400, detail="Not enough stock to increase cart quantity.")
        cart_item.quantity = new_quantity
        cart_item.added_at = datetime.utcnow()
    else:
        cart_item = CartItem(
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
            added_at=datetime.utcnow()
        )
        db.add(cart_item)

    # Decrease product stock
    product.quantity -= quantity

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

def get_cart_items_with_product_image(session: Session, user_id: int):
    statement = (
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(
            selectinload(CartItem.product).selectinload(Product.images)
        )
    )
    cart_items = session.exec(statement).all()

    # Dynamically assign first image to product.image if images exist
    for item in cart_items:
        if item.product and item.product.images:
            # Dynamically attach 'image' attribute (not a DB field)
            setattr(item.product, "image", item.product.images[0].path if hasattr(item.product.images[0], "path") else item.product.images[0])

    return cart_items