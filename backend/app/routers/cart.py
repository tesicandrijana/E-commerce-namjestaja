from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from fastapi.security import OAuth2PasswordBearer
from app.models.models import CartItem, Product, User
from app.schemas.cart import CartItemCreate, CartItemRead, CartItemUpdate
from app.database import get_db
from app.dependencies import get_current_customer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.get("/", response_model=List[CartItemRead])
def get_cart_items(
    *,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    """Get all cart items for the logged-in user"""
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    results = session.exec(statement).all()
    return results


@router.post("/add", response_model=CartItemRead, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    *,
    cart_item_in: CartItemCreate,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    """Add product to cart or update quantity if already in cart"""

    product = session.get(Product, cart_item_in.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    statement = select(CartItem).where(
        CartItem.user_id == current_user.id,
        CartItem.product_id == cart_item_in.product_id,
    )
    existing_item = session.exec(statement).first()

    if existing_item:
        existing_item.quantity += cart_item_in.quantity
        session.add(existing_item)
        session.commit()
        session.refresh(existing_item)
        return existing_item

    cart_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item_in.product_id,
        quantity=cart_item_in.quantity,
    )
    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@router.patch("/{cart_item_id}", response_model=Optional[CartItemRead])
def update_cart_item(
    *,
    cart_item_id: int,
    cart_item_update: CartItemUpdate,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    """Update quantity of a cart item. If quantity <= 0, delete item."""

    cart_item = session.get(CartItem, cart_item_id)

    if not cart_item or cart_item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if cart_item_update.quantity is not None:
        if cart_item_update.quantity <= 0:
            session.delete(cart_item)
            session.commit()
            return None
        cart_item.quantity = cart_item_update.quantity

    session.add(cart_item)
    session.commit()
    session.refresh(cart_item)
    return cart_item


@router.delete("/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cart_item(
    *,
    cart_item_id: int,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_customer),
):
    """Delete a cart item"""

    cart_item = session.get(CartItem, cart_item_id)

    if not cart_item or cart_item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    session.delete(cart_item)
    session.commit()
    # Missing return statement here
