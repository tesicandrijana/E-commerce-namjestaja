from sqlalchemy.orm import Session
from app.models.models import Category
from app.schemas.category import CategoryCreate

def create_category(db: Session, category: CategoryCreate):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session):
    return db.query(Category).all()

def update_category(db: Session, category_id: int, updates: dict):
    db.query(Category).filter(Category.id == category_id).update(updates)
    db.commit()

def delete_category(db: Session, category_id: int):
    category = db.query(Category).get(category_id)
    db.delete(category)
    db.commit()
    return category
