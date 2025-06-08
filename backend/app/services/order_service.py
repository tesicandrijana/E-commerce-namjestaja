from sqlmodel import Session
from app.repositories import order_repository

def get_unassigned_orders(session: Session):
    return order_repository.get_unassigned_orders(session)

def get_order_by_id(session: Session, id:int):
    return order_repository.get_order_by_id(session,id)

def assign_order(session:Session, id: int, assign: bool = True):
    db_order = order_repository.get_order_by_id(session,id)
    db_order.status = "assigned"

    return order_repository.update_order(session, db_order)