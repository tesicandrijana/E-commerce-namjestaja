# crud/complaint.py
from sqlalchemy.orm import Session
from app.models.models import Complaint
from app.schemas.complaint import ComplaintCreate
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

def create_complaint(db: Session, complaint_data: ComplaintCreate):
    try:
        new_complaint = Complaint(**complaint_data.dict())
        db.add(new_complaint)
        db.commit()
        db.refresh(new_complaint)
        return new_complaint
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid data. Check if order exists.")

def get_complaints(db: Session, offset: int = 0, limit: int = 100):
    return db.query(Complaint).offset(offset).limit(limit).all()

def update_complaint(db: Session, complaint_id: int, updates: dict):
    db.query(Complaint).filter(Complaint.id == complaint_id).update(updates)
    db.commit()

def delete_complaint(db: Session, complaint_id: int):
    complaint = db.query(Complaint).get(complaint_id)
    db.delete(complaint)
    db.commit()
    return complaint