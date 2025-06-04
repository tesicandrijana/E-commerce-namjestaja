from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from fastapi.security import OAuth2PasswordBearer
from app.models.models import CartItem, Product, User
from app.crud.cart import get_cart_items_with_product_image, add_to_cart
from app.schemas.cart import CartItemCreate, CartItemRead, CartItemUpdate
from app.schemas.product_image import CartItemWithImageRead
from app.database import get_db
from app.services import user_service

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.get("/with-image", response_model=List[CartItemWithImageRead])
def get_user_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    user_id = current_user.id
    return get_cart_items_with_product_image(db, user_id)




@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    session: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    cart_items = session.exec(statement).all()

    for item in cart_items:
        session.delete(item)

    session.commit()
    return {"detail": "Cart cleared"}




@router.get("/", response_model=List[CartItemRead])
def get_cart_items(
    session: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    results = session.exec(statement).all()
    return results




@router.post("/add", response_model=CartItemRead)
def add_item_to_cart(
    cart_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user)
):
    return add_to_cart(db, current_user.id, cart_data.product_id, cart_data.quantity)




@router.patch("/{cart_item_id}", response_model=Optional[CartItemRead])
def update_cart_item(
    cart_item_id: int,
    cart_item_update: CartItemUpdate,
    session: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
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
    cart_item_id: int,
    session: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    cart_item = session.get(CartItem, cart_item_id)

    if not cart_item or cart_item.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Cart item not found")

    session.delete(cart_item)
    session.commit()
    return {"detail": "Deleted"}



@router.delete("/clear", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    session: Session = Depends(get_db),
    current_user: User = Depends(user_service.get_current_user),
):
    statement = select(CartItem).where(CartItem.user_id == current_user.id)
    cart_items = session.exec(statement).all()

    for item in cart_items:
        session.delete(item)

    session.commit()
    return {"detail": "Cart cleared"}