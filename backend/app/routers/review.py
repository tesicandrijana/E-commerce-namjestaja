from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.review import ReviewCreate, ReviewRead
from app.crud.review import create_review, get_reviews_by_product, get_all_reviews
from app.dependencies import get_current_user, get_admin_user, get_db
from app.models.models import User
from typing import List

router = APIRouter()

@router.post("/", response_model=ReviewRead)
def submit_review(review: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "customer":
        raise HTTPException(status_code=403, detail="Only customers can leave reviews")
    return create_review(db, current_user.id, review)

@router.get("/product/{product_id}", response_model=List[ReviewRead])
def read_reviews(product_id: int, db: Session = Depends(get_db)):
    return get_reviews_by_product(db, product_id)

@router.get("/", response_model=List[ReviewRead])
def read_all_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_admin_user)):
    return get_all_reviews(db)
