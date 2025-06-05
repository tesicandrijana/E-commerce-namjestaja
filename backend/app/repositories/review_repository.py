from sqlmodel import Session, select
from app.models.models import Review, Product
from sqlalchemy import func,desc,and_, case
from typing import Any
from datetime import date


def delete_review(session: Session, review: Review):
    session.delete(review)
    session.commit()

def get_review_by_id(session, id):
    return session.exec(select(Review).where(Review.id == id)).first()

def read_sorted_and_filtered_reviews(
        session, 
        offset: int =  0,
        limit: int = 100,
        sort_by: str | None = "rating",
        sort_dir: str | None = "asc",
        filters: list[Any] = []
        ):
    stmt = (
        select(Review).outerjoin(Product)
    )
    if filters:
        stmt = stmt.where(*filters)

    order_column = getattr(Review, sort_by)

    stmt = stmt.order_by(desc(order_column) if sort_dir == "desc" else order_column)

    return session.exec(stmt).all()