from sqlmodel import Session, select
from app.models.models import Discounts, Product
from sqlalchemy import func,desc,and_, case
from sqlalchemy.orm import joinedload
from typing import Any

#create discount
def create_discount(session: Session, discount: Discounts):
    session.add(discount)

    return discount


#get all discounts(sort, search and filter for active)
def get_discounts(
        session: Session, 
        offset: int = 0, 
        limit: int = 100,
        sort_by: str | None = "id",
        sort_dir: str | None = "asc",
        filters: list[Any] = []):
    
    stmt = select(Discounts).join(Product).offset(offset).limit(limit)
    

    if filters:
        stmt = stmt.where(*filters)

    if sort_by == "product":
        order_column = Product.name
    else:
        order_column = getattr(Discounts, sort_by, Discounts.id)


    stmt = stmt.order_by(desc(order_column).nulls_last() if sort_dir == "desc" else order_column.nulls_last())

    return session.exec(stmt).all()

# find all discounts that overlap with argument
def overlapping_discount(session: Session, discount: Discounts):
    stmt = select(Discounts).where(
        Discounts.product_id == discount.product_id,
        Discounts.start_date <= discount.end_date,
        Discounts.amount > 0,
        Discounts.end_date >= discount.start_date,
    ) 
    return session.exec(stmt).all()


def get_discount_by_id(session: Session, discount_id: int):
    return session.exec(select(Discounts).where(Discounts.id == discount_id)).first()


def edit_discount(session: Session, discount: Discounts):
    session.add(discount)
    session.commit()
    session.refresh(discount)
    return discount


def discount_count(session: Session,filters: list[Any] = []):
    stmt = select(func.count(Discounts.id)).join(Product)
    if filters:
        stmt = stmt.where(*filters)
    return session.exec(stmt).one()