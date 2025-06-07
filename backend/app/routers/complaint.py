# routers/complaint.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.services.user_service import get_current_user
from app.models.models import User, Complaint, Order
from sqlmodel import select
from app.crud import complaint
from app.schemas import complaint as complaint_schema
from app.dependencies import get_db
from app.schemas.complaint import ComplaintOut


router = APIRouter()

#Kupac:Kreira novu reklamaciju (samo za vlastite narudzbe)
@router.post("/", response_model=complaint_schema.Complaint)
def create_complaint(
    payload: complaint_schema.ComplaintCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = db.exec(select(Order).where(Order.id == payload.order_id)).first()
    if not order or order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only submit complaints for your own orders")
    return complaint.create_complaint(db, payload)

# Kupac:svi njegovi complaints
@router.get("/my", response_model=List[complaint_schema.Complaint])
def read_my_complaints(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    statement = select(Complaint).where(Complaint.order.has(customer_id=current_user.id))
    results = db.exec(statement).all()
    return results


#Kupac: jedan konkretan njegov complaint
@router.get("/my/{complaint_id}", response_model=complaint_schema.Complaint)
def read_my_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    complaint = db.exec(select(Complaint).where(Complaint.id == complaint_id)).first()
    if not complaint or complaint.order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this complaint")
    return complaint


@router.get("/assigned", response_model=List[ComplaintOut])
def get_assigned_complaints_for_customer(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user or current_user.role != "customer":
        raise HTTPException(status_code=401, detail="Unauthorized")

    # Get IDs of orders that belong to this customer
    orders = db.query(Order.id).filter(Order.customer_id == current_user.id).subquery()

    # Get complaints linked to these orders that are assigned (assigned_to IS NOT NULL)
    complaints = (
        db.query(Complaint)
        .filter(
            Complaint.order_id.in_(orders),
            Complaint.assigned_to.isnot(None),
        )
        .all()
    )
    return complaints






#stare rute
# @router.post("/", response_model=complaint_schema.Complaint)
# def create_complaint(payload: complaint_schema.ComplaintCreate, db: Session = Depends(get_db)):
#     return complaint.create_complaint(db, payload)

# @router.get("/", response_model=List[complaint_schema.Complaint])
# def read_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     return complaint.get_complaints(db, skip=skip, limit=limit)

# @router.get("/{complaint_id}", response_model=complaint_schema.Complaint)
# def read_complaint(complaint_id: int, db: Session = Depends(get_db)):
#     db_complaint = complaint.get_complaint(db, complaint_id)
#     if not db_complaint:
#         raise HTTPException(status_code=404, detail="Complaint not found")
#     return db_complaint

