from typing import List, Optional
from sqlmodel import Session
from app.models.models import Category  # Your SQLModel category model
from app.schemas.category import CategoryCreate

def get_category(session: Session, category_id: int) -> Optional[Category]:
    return session.get(Category, category_id)

def get_category_by_name(session: Session, name: str) -> Optional[Category]:
    return session.query(Category).filter(Category.name == name).first()

def get_categories(session: Session, offset: int = 0, limit: int = 100) -> List[Category]:
    return session.query(Category).offset(offset).limit(limit).all()

def create_category(session: Session, category_data: CategoryCreate) -> Category:
    category = Category.from_orm(category_data)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

def update_category(session: Session, category_id: int, updates: dict) -> Optional[Category]:
    category = get_category(session, category_id)
    if not category:
        return None
    for key, value in updates.items():
        setattr(category, key, value)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

def delete_category(session: Session, category_id: int) -> bool:
    category = get_category(session, category_id)
    if not category:
        return False
    session.delete(category)
    session.commit()
    return True
