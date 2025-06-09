from sqlmodel import Session, select
from app.models.models import User
from app.schemas.user import UserCreate, UserUpdate

def get_users(session: Session, offset: int = 0, limit: int = 100) -> list[User]:
    return session.exec(select(User).offset(offset).limit(limit)).all()

def get_user(session: Session, email: str) -> User:
    return session.exec(select(User).where(User.email == email)).first()

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(session: Session, user_id: int, user_update: UserUpdate):
    db_user = session.get(User, user_id)
    if not db_user:
        return None  # Ili baci grešku, npr. raise HTTPException(...)
    
    user_data = user_update.dict(exclude_unset=True)
    for key, value in user_data.items():
        setattr(db_user, key, value)
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def get_all_delivery(session: Session):
    return session.exec(select(User).where(User.role == 'delivery', User.is_active == True)).all()