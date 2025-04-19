# crud/review.py
from sqlalchemy.orm import Session
from app.models.models import Review
from app.schemas.review import ReviewCreate

def create_review(db: Session, review: ReviewCreate):
    db_review = Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews(db: Session):
    return db.query(Review).all()

def update_review(db: Session, review_id: int, updates: dict):
    db.query(Review).filter(Review.id == review_id).update(updates)
    db.commit()

def delete_review(db: Session, review_id: int):
    review = db.query(Review).get(review_id)
    db.delete(review)
    db.commit()
    return review