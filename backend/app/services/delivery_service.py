from sqlmodel import Session
from app.models.models import Delivery
from app.repositories import delivery_repository
from app.services import order_service

def get_all_deliveries_assigned_to(
    session: Session, delivery_person_id: int, offset: int = 0, limit: int | None = 0
):
    return delivery_repository.get_all_deliveries_assigned_to(session, delivery_person_id, offset, limit)

def read_deliveries_and_orders(
        session: Session
):
    orders = order_service.get_unassigned_orders(session)
    deliveries = delivery_repository.get_all_deliveries_not_delivered(session)
    deliveries_final = []
    for delivery in deliveries:
        deliveries_final.append({
            "id": delivery.id,
            "order_id":delivery.order_id,
            "delivery_person_id": delivery.delivery_person_id,
            "status" : delivery.status,
            "date":delivery.date,
            "order": order_service.get_order_by_id(session, delivery.order_id)
        })
    return {
        "orders" : orders,
        "deliveries" : deliveries_final
    }

def assign_delivery(session: Session, order_id: int, delivery_person_id:int | None = None):
    db_delivery = delivery_repository.get_delivery_by_id(session, order_id)
    
    if delivery_person_id != None:
        status = "assigned"
    else:
        status = "unassigned"

    if db_delivery is None:
        db_delivery = Delivery(order_id=order_id, status = status,delivery_person_id=delivery_person_id)
    else: 
        db_delivery.delivery_person_id = delivery_person_id
        db_delivery.status = "assigned" if delivery_person_id is not None else "unassigned"
    delivery = delivery_repository.assign_delivery(session,db_delivery)
    return delivery
