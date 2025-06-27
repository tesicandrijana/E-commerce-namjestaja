from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException
from app.models.models import User, WorkerRequest, Order, Review
from app.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, user_create: UserCreate):
    db_user = User(**user_create.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_employees(db: Session, offset: int, limit: int):
    return db.query(User).filter(User.is_active == True, User.role != "customer").offset(offset).limit(limit).all()


def update_user(db: Session, user_id: int, user_update: UserUpdate):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

# zaposlenik azurira profil
def update_support_profile(session, user_id: int, name: str | None = None, password: str | None = None):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if name:
        user.name = name
    if password:
        user.password = password  # (već hashirano u servisu)
    session.commit()
    session.refresh(user)
    return user



def delete_user(db: Session, user_id: int):
    db_user = db.get(User, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def count_users_by_role(db: Session):
    role_counts = db.query(User.role, func.count(User.id)).filter(User.role != "customer").group_by(User.role).all()
    return {role: count for role, count in role_counts}


def get_archived_users(db: Session, search: str):
    query = db.query(User).filter(User.is_active == False)
    if search:
        query = query.filter(or_(User.name.ilike(f"%{search}%"), User.role.ilike(f"%{search}%")))
    return query.all()


def restore_users(db: Session, user_ids: list[int]):
    users = db.query(User).filter(User.id.in_(user_ids)).all()
    if not users:
        raise HTTPException(status_code=404, detail="No users found with given IDs")

    not_archived = [u.id for u in users if u.is_active]
    if not_archived:
        raise HTTPException(status_code=400, detail=f"Users with IDs {not_archived} are already active")

    for user in users:
        user.is_active = True

    db.commit()
    return {"detail": f"{len(users)} users restored successfully"}


def restore_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_active:
        raise HTTPException(status_code=400, detail="User is already active")

    user.is_active = True
    db.commit()
    db.refresh(user)
    return {"detail": f"User with ID {user_id} restored successfully"}


def archive_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User is already archived")

    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


def search_employees(db: Session, search: str):
    return db.query(User).filter(User.is_active == True, User.role != "customer", or_(User.name.ilike(f"%{search}%"), User.role.ilike(f"%{search}%"))).limit(10).all()


def get_all_delivery(db: Session):
    return db.query(User).filter(User.role == "delivery", User.is_active == True).all()
