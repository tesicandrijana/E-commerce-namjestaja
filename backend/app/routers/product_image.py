from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas.product_image import ProductImageCreate, ProductImageUpdate, ProductImageRead
from app.models.models import ProductImage
from app.crud.product_image import (
    create_product_image,
    get_product_image,
    get_product_images_by_product,
    update_product_image,
    delete_product_image,
)
from app.dependencies import get_db  # your session dependency

router = APIRouter(prefix="/product_images", tags=["Product Images"])


@router.post("/", response_model=ProductImageRead, status_code=status.HTTP_201_CREATED)
def create_image(product_image: ProductImageCreate, db: Session = Depends(get_db)):
    db_image = create_product_image(db, product_image)
    return db_image


@router.get("/{image_id}", response_model=ProductImageRead)
def read_image(image_id: int, db: Session = Depends(get_db)):
    db_image = get_product_image(db, image_id)
    if not db_image:
        raise HTTPException(status_code=404, detail="Product image not found")
    return db_image


@router.get("/product/{product_id}", response_model=List[ProductImageRead])
def read_images_by_product(product_id: int, db: Session = Depends(get_db)):
    images = get_product_images_by_product(db, product_id)
    return images


@router.patch("/{image_id}", response_model=ProductImageRead)
def update_image(image_id: int, updates: ProductImageUpdate, db: Session = Depends(get_db)):
    updated = update_product_image(db, image_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Product image not found")
    return updated


@router.delete("/{image_id}", response_model=ProductImageRead)
def delete_image(image_id: int, db: Session = Depends(get_db)):
    deleted = delete_product_image(db, image_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product image not found")
    return deleted
