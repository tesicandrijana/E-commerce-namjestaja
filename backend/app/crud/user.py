from sqlalchemy.orm import Session
from app.models.models import User, WorkerRequest   # assuming you have a WorkerRequest model
from fastapi import HTTPException
from app.schemas.user import UserCreate

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, updates: dict):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, value in updates.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return user

def get_worker_request(db: Session, user_id: int):
    return db.query(WorkerRequest).filter(WorkerRequest.user_id == user_id).first()

def create_worker_request(db: Session, user_id: int, desired_role: str):
    existing = get_worker_request(db, user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Worker request already submitted")

    new_req = WorkerRequest(user_id=user_id, desired_role=desired_role, status="pending")
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return new_req

def count_users_by_role(db: Session, role: str) -> int:
    return db.query(User).filter(User.role == role).count()

def get_worker_request_by_user_id(db: Session, user_id: int):
    return get_worker_request(db, user_id)

def update_user_role(db: Session, user_id: int, new_role: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if new_role not in ["manager", "support", "delivery"]:
        raise HTTPException(status_code=400, detail="Invalid worker role")

    if new_role == "manager":
        current_managers = db.query(User).filter(User.role == "manager").count()
        if current_managers >= 3:
            raise HTTPException(status_code=400, detail="Manager limit reached (max 3)")

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user
