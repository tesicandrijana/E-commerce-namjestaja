from sqlalchemy.orm import Session
from app.models.models import Product
from app.schemas.product import ProductCreate

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def get_products(db: Session):
    return db.query(Product).all()

def get_product_by_id(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def update_product(db: Session, product_id: int, updates: dict):
    db.query(Product).filter(Product.id == product_id).update(updates)
    db.commit()

def delete_product(db: Session, product_id: int):
    product = db.query(Product).get(product_id)
    db.delete(product)
    db.commit()
    return product
