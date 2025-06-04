from sqlmodel import Session, select
from app.models.models import Discount, Product
from sqlalchemy import func,desc,and_, case
from typing import Any

#create discount
def create_discount(session: Session, discount: Discount):
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
    
    stmt = select(Discount).join(Product).offset(offset).limit(limit)
    

    if filters:
        stmt = stmt.where(*filters)

    if sort_by == "product":
        order_column = Product.name
    else:
        order_column = getattr(Discount, sort_by, Discount.id)


    stmt = stmt.order_by(desc(order_column).nulls_last() if sort_dir == "desc" else order_column.nulls_last())

    return session.exec(stmt).all()

# find all discounts that overlap with argument
def overlapping_discount(session: Session, discount: Discount):
    stmt = select(Discount).where(
        Discount.product_id == discount.product_id,
        Discount.start_date <= discount.end_date,
        Discount.amount > 0,
        Discount.end_date >= discount.start_date,
    ) 
    return session.exec(stmt).all()


def get_discount_by_id(session: Session, discount_id: int):
    return session.exec(select(Discount).where(Discount.id == discount_id)).first()


def edit_discount(session: Session, discount: Discount):
    session.add(discount)
    session.commit()
    session.refresh(discount)
    return discount


def discount_count(session: Session,filters: list[Any] = []):
    stmt = select(func.count(Discount.id))
    if filters:
        stmt = stmt.where(*filters)
    return session.exec(stmt).one()