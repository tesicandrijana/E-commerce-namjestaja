from sqlmodel import Session, select
from app.models.models import User

def get_users(session: Session, offset: int = 0, limit: int = 100)->list[User]:
    return session.exec(select(User).offset(offset).limit(limit)).all()

def get_user(session: Session,email: str) -> User:
    return session.exec(select(User).where(User.email == email)).first()