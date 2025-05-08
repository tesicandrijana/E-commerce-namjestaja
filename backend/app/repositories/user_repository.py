from sqlmodel import Session, select
from app.models.models import User
from app.schemas.user import UserCreate

def get_users(session: Session, offset: int = 0, limit: int = 100)->list[User]:
    return session.exec(select(User).offset(offset).limit(limit)).all()

def get_user(session: Session,email: str) -> User:
    return session.exec(select(User).where(User.email == email)).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user