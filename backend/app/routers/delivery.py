from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.models.models import User
from app.services.user_service import role_check

from app.crud import delivery
from app.schemas import delivery as delivery_schema
from app.dependencies import get_db

router = APIRouter()

# Dashboard
@router.get("/dashboard", tags=["Delivery Dashboard"])
def delivery_dashboard(current_user: User = Depends(role_check(["delivery"]))):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "profile_link": f"/delivery/profile/{current_user.id}"
    }

@router.post("/", response_model=delivery_schema.Delivery)
def create_delivery(delivery: delivery_schema.DeliveryCreate, db: Session = Depends(get_db)):
    return delivery.create_delivery(db, delivery)

@router.get("/", response_model=List[delivery_schema.Delivery])
def read_deliveries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return delivery.get_deliveries(db, skip=skip, limit=limit)

@router.get("/{delivery_id}", response_model=delivery_schema.Delivery)
def read_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = delivery.get_delivery(db, delivery_id)
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return db_delivery

# azuriranje statusa dostave
@router.put("/{delivery_id}/status", response_model=delivery_schema.Delivery)
def update_delivery_status(delivery_id: int, status: str, db: Session = Depends(get_db)):
    db_delivery = delivery.get_delivery(db, delivery_id)
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")

    updated_delivery = delivery.update_delivery_status(db, delivery_id, status)
    return updated_delivery

#dohvati prof dostavljaca
@router.get("/profile/{id}", response_model=delivery_schema.DeliveryPersonProfile)
def get_delivery_profile(id: int, db: Session = Depends(get_db), current_user: User = Depends(role_check(["delivery"]))):
    user = db.query(User).filter(User.id == id, User.role == "delivery").first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

#azuriraj prof
@router.put("/profile/{id}", response_model=delivery_schema.DeliveryPersonProfile)
def update_delivery_profile(id: int, updates: delivery_schema.DeliveryPersonUpdate, db: Session = Depends(get_db), current_user: User = Depends(role_check(["delivery"]))):
    user = db.query(User).filter(User.id == id, User.role == "delivery").first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in updates.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user
