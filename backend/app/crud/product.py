from typing import Optional, List
from sqlmodel import Session, select
from fastapi import HTTPException
from app.models.models import Product
from app.schemas.product import ProductCreate

def create_product(db: Session, product: ProductCreate) -> Product:
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    statement = select(Product).offset(skip).limit(limit)
    results = db.exec(statement)
    return results.all()

def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    statement = select(Product).where(Product.id == product_id)
    product = db.exec(statement).first()
    return product

def update_product(db: Session, product_id: int, updates: dict) -> Optional[Product]:
    product = get_product_by_id(db, product_id)
    if not product:
        return None
    for key, value in updates.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

def delete_product(db: Session, product_id: int) -> Product:
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        db.delete(product)
        db.commit()
        return product
    except Exception as e:
        print(f"Error while deleting product: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete product")

def get_products_starting_from_id(db: Session, start_id: int = 26, limit: int = 100) -> List[Product]:
    statement = select(Product).where(Product.id >= start_id).limit(limit)
    results = db.exec(statement)
    return results.all()

def get_product_with_category(db: Session, product_id: int) -> Optional[Product]:
    from sqlalchemy.orm import selectinload
    statement = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.category))
    )
    product = db.exec(statement).first()
    return product
