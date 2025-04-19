# app/routers/review.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import review
from app.schemas import review as review_schema
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=review_schema.Review)
def create_review(review_data: review_schema.ReviewCreate, db: Session = Depends(get_db)):
    return review.create_review(db, review_data)

@router.get("/", response_model=List[review_schema.Review])
def read_reviews(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return review.get_reviews(db, skip=skip, limit=limit)
