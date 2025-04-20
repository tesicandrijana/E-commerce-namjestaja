from sqlalchemy.orm import Session
from app.models.models import Review
from app.schemas.review import ReviewCreate

def create_review(db: Session, customer_id: int, review: ReviewCreate):
    db_review = Review(**review.dict(), customer_id=customer_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_reviews_by_product(db: Session, product_id: int):
    return db.query(Review).filter(Review.product_id == product_id).all()

def get_all_reviews(db: Session):
    return db.query(Review).all()
