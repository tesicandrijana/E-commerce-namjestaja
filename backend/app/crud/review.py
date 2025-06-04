from sqlmodel import Session, select
from app.models.models import Review, User # Ensure correct import
from app.schemas.review import ReviewCreate, ReviewUpdate  # Your Pydantic schema
from fastapi import HTTPException, status, Depends
from app.services.user_service import get_current_user
from app.database import get_db
  # adjust import if needed

def create_review(db: Session, customer_id: int, review: ReviewCreate):
    # Check if the customer already reviewed this product
    existing_review = db.query(Review).filter(
        Review.customer_id == customer_id,
        Review.product_id == review.product_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this product. Do you want to update it instead?"
        )

    db_review = Review(
        product_id=review.product_id,
        rating=review.rating,
        comment=review.comment,
        customer_id=customer_id
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


def get_reviews_by_product(db: Session, product_id: int):
    # Query reviews with join to user to get customer name
    results = (
        db.query(
            Review.id,
            Review.product_id,
            Review.customer_id,
            Review.rating,
            Review.comment,
            Review.created_at,
            User.name.label("customer_name"),
        )
        .join(User, Review.customer_id == User.id)
        .filter(Review.product_id == product_id)
        .all()
    )
    return results


def get_all_reviews(db: Session):
    return db.query(Review).all()
