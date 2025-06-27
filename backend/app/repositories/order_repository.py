from sqlmodel import Session, select
from app.models.models import Order, Delivery, OrderItem
from typing import Any
from sqlalchemy import desc, func,extract
from sqlalchemy.orm import joinedload



def get_unassigned_orders(session: Session):
    return session.exec(
        select(Order).where(
            Order.id.not_in(select(Delivery.order_id)), Order.status != "assigned"
        )
    ).all()


def get_order_by_id(session: Session, id: int):
    return session.exec(select(Order).where(Order.id == id)).first()


def update_order(session: Session, order: Order):
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

def get_sorted_and_filtered_orders(
    session,
    offset: int = 0,
    limit: int | None = None,
    sort_by: str | None = "id",
    sort_dir: str | None = "asc",
    filters: list[Any] = [],
):
    stmt = (
        select(Order)
        .offset(offset)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
        .limit(limit)
    )
    order_column = getattr(Order, sort_by)

    if filters:
        stmt = stmt.where(*filters)

    stmt = stmt.order_by(
        desc(order_column).nulls_last()
        if sort_dir == "desc"
        else order_column.nulls_last()
    )

    return session.exec(stmt).unique().all()


def count_orders(session: Session, filters: list[Any] = []):
    stmt = select(func.count(Order.id))
    if filters:
        stmt = stmt.where(*filters)
    return session.exec(stmt).one()

def orders_per_month(session: Session):
    return session.exec(select(
            extract("month", Order.date).label("month"),
            func.count(Order.id).label("count")
        )
        .group_by("month")
        .order_by("month")).all()


# detalji narudzbe sa joinovima
def get_order_with_details(session: Session, order_id: int):
    return session.exec(
        select(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .where(Order.id == order_id)
    ).first()
