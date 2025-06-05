from sqlmodel import Session
from typing import Annotated
from fastapi import HTTPException
from app.schemas import review as review_schema
from app.repositories import review_repository
from app.models.models import Review,Product
from sqlalchemy import and_

def read_sorted_and_filtered_reviews(
        session: Session, 
        offset: int =  0,
        limit: int = 100,
        sort_by: str | None = "rating",
        sort_dir: str | None = "asc",
        rating: int | None = None,
        search: str | None = None
):
    valid_sort_columns = {"rating", "created_at"}  

    if sort_by not in valid_sort_columns:
        raise HTTPException(status_code=400, detail=sort_by)

    filters = []
    if rating: 
        filters.append(Review.rating == rating)
    if search:
        filters.append(Product.name.ilike(f"%{search}%"))

    return review_repository.read_sorted_and_filtered_reviews(
        session, offset, limit, sort_by, sort_dir, filters
    )


def delete_review(session: Session, review_id):
    db_review = review_repository.get_review_by_id(session, review_id)
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    review_repository.delete_review(session,db_review)

    return {"ok": True}