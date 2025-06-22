from sqlmodel import Session
from app.models.models import Delivery
from app.repositories import delivery_repository,order_repository
from app.services import order_service
from fastapi import HTTPException

def get_all_deliveries_assigned_to(
    session: Session, delivery_person_id: int, offset: int = 0, limit: int | None = 0
):
    db_deliveries = delivery_repository.get_all_deliveries_assigned_to(session, delivery_person_id, offset, limit)
    deliveries=[]
    for delivery in db_deliveries:
        order_dict = delivery.order.model_dump()
        order_dict["customer_name"] = delivery.order.customer.name  

        deliveries.append({
            "id": delivery.id,
            "order_id": delivery.order_id,
            "delivery_person_id": delivery.delivery_person_id,
            "status": delivery.status,
            "date": delivery.date,
            "order": order_dict  
        })
    return deliveries
    
    

def read_deliveries_and_orders(
        session: Session
):
    orders = order_service.get_unassigned_orders(session)
    deliveries = delivery_repository.get_all_deliveries_not_delivered(session)
    deliveries_final = []
    for delivery in deliveries:
        order = order_service.get_order_by_id(session, delivery.order_id)
        order_dict = order.model_dump()
        order_dict["customer_name"] = order.customer.name  

        deliveries_final.append({
            "id": delivery.id,
            "order_id": delivery.order_id,
            "delivery_person_id": delivery.delivery_person_id,
            "status": delivery.status,
            "date": delivery.date,
            "order": order_dict  
        })
    return deliveries_final

def get_delivery_by_order_id(session: Session, id: int):
    return delivery_repository.get_delivery_by_order_id(session,id)

def assign_delivery(session: Session, order_id: int, delivery_person_id:int | None = None):
    db_delivery = delivery_repository.get_delivery_by_order_id(session, order_id)
    
    if delivery_person_id != None:
        status = "assigned"
    else:
        status = "unassigned"

    if db_delivery is None:
        db_delivery = Delivery(order_id=order_id, status = status,delivery_person_id=delivery_person_id)
    else: 
        db_delivery.delivery_person_id = delivery_person_id
        db_delivery.status = "assigned" if delivery_person_id is not None else "unassigned"

    delivery = delivery_repository.update_delivery(session,db_delivery)
    return delivery

def get_delivery_by_id(session: Session, id:int):
    return delivery_repository.get_delivery_by_id(session,id)

def change_delivery_status(session:Session, delivery_id: int, status: str):
    db_delivery = get_delivery_by_id(session, delivery_id)
    if db_delivery != None:
        db_delivery.status = status
        delivery_repository.update_delivery(session,db_delivery)
        db_order = order_service.get_order_by_id(session, db_delivery.order_id)
        if db_order != None: 
            db_order.status = status
            order_repository.update_order(session, db_order)
    else:
        raise HTTPException(status_code=404, detail="Delivery not found")

    return db_delivery

