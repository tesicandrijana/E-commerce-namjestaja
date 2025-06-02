from sqlmodel import Session, select
from app.models.models import Discount


def create_discount(session: Session, discount: Discount):
    session.add(discount)

    return discount


def get_discounts(session: Session, offset: int = 0, limit: int = 10):
    return session.exec(select(Discount)).all()


def overlapping_discount(session: Session, discount: Discount):
    stmt = select(Discount).where(
        Discount.product_id == discount.product_id,
        Discount.start_date <= discount.end_date,
        Discount.end_date >= discount.start_date,
    )
    return session.exec(stmt).all()
