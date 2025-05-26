# crud/complaint.py
from sqlalchemy.orm import Session
from app.models.models import Complaint
from app.schemas.complaint import ComplaintCreate

def create_complaint(db: Session, complaint: ComplaintCreate):
    db_complaint = Complaint(**complaint.dict())
    db.add(db_complaint)
    db.commit()
    db.refresh(db_complaint)
    return db_complaint

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