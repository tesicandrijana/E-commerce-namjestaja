# routers/complaint.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.crud import complaint
from app.schemas import complaint as complaint_schema
from app.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=complaint_schema.Complaint)
def create_complaint(complaint: complaint_schema.ComplaintCreate, db: Session = Depends(get_db)):
    return complaint.create_complaint(db, complaint)

@router.get("/", response_model=List[complaint_schema.Complaint])
def read_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return complaint.get_complaints(db, skip=skip, limit=limit)

@router.get("/{complaint_id}", response_model=complaint_schema.Complaint)
def read_complaint(complaint_id: int, db: Session = Depends(get_db)):
    db_complaint = complaint.get_complaint(db, complaint_id)
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return db_complaint