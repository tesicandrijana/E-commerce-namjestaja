from sqlalchemy.orm import Session
from app.models.models import Category
from app.schemas.category import CategoryCreate

def create_category(db: Session, category_data: CategoryCreate):
    db_category = Category(name=category_data.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session, offset: int = 0, limit: int = 100):
    return db.query(Category).offset(offset).limit(limit).all()


def update_category(db: Session, category_id: int, updates: dict):
    db.query(Category).filter(Category.id == category_id).update(updates)
    db.commit()
    return db.query(Category).get(category_id)


def delete_category(db: Session, category_id: int):
    category = db.query(Category).get(category_id)
    if not category:
        return False
    db.delete(category)
    db.commit()
    return True


