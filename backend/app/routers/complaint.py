from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.services.user_service import get_current_user
from app.models.models import User
from app.dependencies import get_db
from app.schemas.complaint import Complaint, ComplaintCreate, ComplaintOut
from app.services import complaint_service

router = APIRouter()


#Kupac:Kreira novu reklamaciju
@router.post("/", response_model=Complaint)
def create_complaint(
    payload: ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return complaint_service.create_complaint_service(db, payload, current_user.id)


# Kupac:svi njegovi complaints
@router.get("/my", response_model=List[Complaint])
def read_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return complaint_service.read_my_complaints_service(db, current_user.id)


#Kupac: jedan konkretan njegov complaint
@router.get("/my/{complaint_id}", response_model=Complaint)
def read_my_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return complaint_service.read_my_complaint_service(db, complaint_id, current_user.id)

# Svi assigned complaints jednog kupca
@router.get("/assigned", response_model=List[ComplaintOut])
def get_assigned_complaints_for_customer(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return complaint_service.get_assigned_complaints_for_customer_service(db, current_user)