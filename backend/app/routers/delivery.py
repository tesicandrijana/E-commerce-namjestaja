# routers/delivery.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import delivery
from app.schemas import delivery as delivery_schema
from app.dependencies import get_db

router = APIRouter()

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