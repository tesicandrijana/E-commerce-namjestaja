from sqlmodel import Session, select
from app.models.models import Order,Delivery

def get_unassigned_orders(session: Session):
    return session.exec(select(Order).where(Order.id.not_in(select(Delivery.order_id)), Order.status != "assigned")).all()

def get_order_by_id(session: Session, id: int):
    return session.exec(select(Order).where(Order.id == id)).first()

def update_order(session: Session, order: Order):
    session.add(order)
    session.commit()
    session.refresh(order)
    return order