from sqlmodel import Session, select
from app.models.models import Discounts


def create_discount(session: Session, discount: Discounts):
    session.add(discount)

    return discount


def get_discounts(session: Session, offset: int = 0, limit: int = 10):
    return session.exec(select(Discounts)).all()


def overlapping_discount(session: Session, discount: Discounts):
    stmt = select(Discounts).where(
        Discounts.product_id == discount.product_id,
        Discounts.start_date <= discount.end_date,
        Discounts.end_date >= discount.start_date,
    )
    return session.exec(stmt).all()
