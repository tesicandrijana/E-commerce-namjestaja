from sqlalchemy.orm import Session
from app.models.models import User, WorkerRequest   # assuming you have a WorkerRequest model
from fastapi import HTTPException
from app.schemas.user import UserCreate
from sqlalchemy import func
from app.models.models import Order, Review
from app.services.user_service import hash_password, validate_password_strength 

def create_user(db: Session, user: UserCreate):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def update_user(db: Session, user_id: int, updates: dict):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in updates.items():
        if key == "password" and value:  # Samo ako nova lozinka poslana
            # Heširanje nove lozinke
            hashed = hash_password(value)
            setattr(user, "password", hashed)  # Ažuriraj polje "password" sa heširanom lozinkom
        elif key != "password" and value is not None:  # Ostaviti ostale podatke netaknutima
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    db_user = db.get(User, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()

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


def get_worker_request_by_user_id(db: Session, user_id: int):
    return get_worker_request(db, user_id)

def update_user_role(db: Session, user_id: int, new_role: str):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if new_role not in ["manager", "support", "delivery", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid worker role")

    if new_role == "manager":
        current_managers = db.query(User).filter(User.role == "manager").count()
        if current_managers >= 3:
            raise HTTPException(status_code=400, detail="Manager limit reached (max 3)")

    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


def get_user_stats(db: Session):
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),
        "by_role": {
            role: db.query(User).filter(User.role == role).count()
            for role in ["admin", "manager", "support", "delivery", "customer"]
        }
    }

def get_sales_stats(db: Session):
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_price)).scalar() or 0

    return {
        "total_orders": total_orders,
        "total_revenue": float(total_revenue),
    }

def get_rating_stats(db: Session):
    total_reviews = db.query(Review).count()
    average_rating = db.query(func.avg(Review.rating)).scalar() or 0

    return {
        "total_reviews": total_reviews,
        "average_rating": round(float(average_rating), 2),
    }
