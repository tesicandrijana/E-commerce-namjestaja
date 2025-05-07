from sqlmodel import Session, select
from app.models.models import Category

def get_categories(session: Session, offset: int = 0, limit: int = 100)->list[Category]:
    return session.exec(select(Category).offset(offset).limit(limit)).all()