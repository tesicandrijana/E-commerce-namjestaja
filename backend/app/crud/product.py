from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException
from app.models.models import Product
from app.schemas.product import ProductCreate
from sqlalchemy.orm import selectinload
from sqlmodel import select

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()


def get_product_by_id(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()


def update_product(db: Session, product_id: int, updates: dict):
    product_query = db.query(Product).filter(Product.id == product_id)
    existing_product = product_query.first()
    if not existing_product:
        return None
    product_query.update(updates)
    db.commit()
    db.refresh(existing_product)
    return existing_product


def get_products_starting_from_id(db: Session, start_id: int = 26, limit: int = 100):
    statement = select(Product).where(Product.id >= start_id).limit(limit)
    results = db.exec(statement)
    return results.all()

def delete_product(db: Session, product_id: int):
    print(f"Trying to delete product {product_id}")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        db.delete(product)
        db.commit()
        return product
    except Exception as e:
        print(f"Error while deleting product: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete product")


def get_product_with_category(session: Session, product_id: int) -> Optional[Product]:
    statement = (
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.category))
    )
    product = session.exec(statement).first()
    return product
