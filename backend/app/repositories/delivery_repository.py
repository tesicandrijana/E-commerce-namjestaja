from sqlmodel import Session, select
from app.models.models import Delivery
from sqlalchemy.orm import joinedload


def get_delivery_by_id(session: Session, id: int):
    return session.exec(select(Delivery).where(Delivery.order_id == id)).first()

def get_all_deliveries_assigned_to(session: Session, delivery_person_id: int, offset: int = 0, limit: int | None = 0):
    stmt = select(Delivery).where(Delivery.delivery_person_id == delivery_person_id).offset(offset)
    if limit:
        stmt.limit(limit)
    return session.exec(stmt).all()

def get_all_deliveries_not_delivered(session: Session):
    return session.exec(select(Delivery).options(joinedload(Delivery.order)).where(Delivery.status !="delivered")).all()

def assign_delivery(session: Session, delivery: Delivery):
    session.add(delivery)
    session.commit()
    session.refresh(delivery)
    return delivery
