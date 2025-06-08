# routers/delivery.py
from fastapi import APIRouter, Depends, HTTPException
from  sqlmodel import Session
from typing import List, Annotated

from app.crud import delivery
from app.services import delivery_service
from app.schemas import delivery as delivery_schema
from app.dependencies import get_db

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=delivery_schema.Delivery)
def create_delivery(delivery: delivery_schema.DeliveryCreate, db: Session = Depends(get_db)):
    return delivery.create_delivery(db, delivery)

@router.get("/manager")
def read_deliveries(session: SessionDep):
    return delivery_service.read_deliveries_and_orders(session)


@router.get("/delivery_person/{delivery_person_id}")
def get_all_deliveries_assigned_to(session: SessionDep, delivery_person_id: int ,offset: int = 0, limit: int | None = None):
    return delivery_service.get_all_deliveries_assigned_to(session, delivery_person_id, offset, limit)

@router.put("/assign/{order_id}")
def assign_delivery(session: SessionDep, order_id: int, delivery_person_id:int | None = None):
    return delivery_service.assign_delivery(session, order_id, delivery_person_id)

@router.get("/{delivery_id}", response_model=delivery_schema.Delivery)
def read_delivery(delivery_id: int, db: Session = Depends(get_db)):
    db_delivery = delivery.get_delivery(db, delivery_id)
    if not db_delivery:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return db_delivery


