from fastapi import APIRouter, Depends, HTTPException,Query
from sqlmodel import Session, select
from app.schemas.review import ManagerReviewResponse,ReviewCreate, ReviewRead, ReviewOut, ReviewUpdate
from app.crud.review import create_review, get_reviews_by_product, get_all_reviews
from app.dependencies import  get_admin_user, get_db
from app.models.models import User, Review
from sqlalchemy import func
from app.services.user_service import get_current_user
from app.services import review_service
from typing import List, Annotated

router = APIRouter()

SessionDep = Annotated[Session, Depends(get_db)]

@router.post("/", response_model=ReviewCreate)
def submit_review(
    review: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can leave reviews")
    return create_review(db, current_user.id, review)

@router.get("/manager",response_model = list[ManagerReviewResponse])
def read_sorted_and_filtered_reviews(
    session: SessionDep, 
    offset: int = 0, 
    limit: int | None = None,
    sort_by: Annotated[str, Query(enum=["rating", "created_at"])] = "rating",
    sort_dir: Annotated[str,Query(enum=["asc", "desc"])] = "asc",
    rating: int | None = None,
    search:  str | None = None,
    ):
    return review_service.read_sorted_and_filtered_reviews(session, offset,limit,sort_by, sort_dir, rating, search)

@router.delete("/{review_id}")
def delete_review(session: SessionDep, review_id: int):
    return review_service.delete_review(session, review_id)


@router.put("/{review_id}")
def update_review(review_id: int, review_update: ReviewUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_review = db.query(Review).filter(Review.id == review_id, Review.customer_id == current_user.id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    db_review.rating = review_update.rating
    db_review.comment = review_update.comment
    db.commit()
    db.refresh(db_review)
    return db_review



@router.get("/product/{product_id}/user")
def get_user_review_for_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    review = db.exec(
        select(Review).where(
            Review.product_id == product_id,
            Review.customer_id == current_user.id
        )
    ).first()
    if not review:
        return {"review": None}
    return {"review": review}



@router.get("/product/{product_id}", response_model=List[ReviewRead])
def read_reviews(product_id: int, db: Session = Depends(get_db)):
    return get_reviews_by_product(db, product_id)




@router.get("/product/{product_id}/rating")
def get_product_rating(product_id: int, db: Session = Depends(get_db)):
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product_id).scalar()
    count = db.query(func.count(Review.id)).filter(Review.product_id == product_id).scalar()

    if avg_rating is None:
        raise HTTPException(status_code=404, detail="No reviews found for this product")

    return {
        "average_rating": round(avg_rating, 1),
        "review_count": count
    }



@router.get("/", response_model=List[ReviewRead])
def read_all_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return get_all_reviews(db)