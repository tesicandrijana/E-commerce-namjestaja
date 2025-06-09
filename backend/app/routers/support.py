from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.orm import Session, selectinload
from typing import List, Annotated, Optional

from app.models.models import Complaint, User, Order
from app.schemas import complaint as complaint_schema
from app.schemas.complaint import ComplaintWithCustomer
# from app.crud.user import get_user_by_id
from app.dependencies import get_db  #get_support_user - ne treba
from app.services.user_service import role_check

from app.crud import complaint as complaint_crud
from app.schemas.complaint import ComplaintUpdate

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]


#Dashboard
@router.get("/", tags=["Support"])
def support_dashboard(current_user: User = Depends(role_check(["support"]))):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "profile_link": f"/support/profile/{current_user.id}"
    }

# Profil zaposlenika
@router.get("/profile/{user_id}", tags=["Support"])
def get_support_profile(
    user_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    user = session.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role
    }

#GET:Pregled svih reklamacija
@router.get("/complaints", response_model=List[ComplaintWithCustomer])
def get_all_complaints(
    session: SessionDep,
    offset: int = 0,
    limit: int = 100,
    current_user: User = Depends(role_check(["support"]))
): 

    complaints = session.exec(select(Complaint).options(selectinload(Complaint.order).selectinload(Order.customer))).all()

    result = []
    for complaint in complaints:
        customer_name = (
            complaint.order.customer.name
            if complaint.order and complaint.order.customer
            else "Unknown"
        )

        result.append({
            "id": complaint.id,
            "status": complaint.status,
            "description": complaint.description,
            "preferred_resolution": complaint.preferred_resolution,
            "final_resolution": complaint.final_resolution,
            "assigned_to": complaint.assigned_to,
            "created_at": complaint.created_at,
            "order_id": complaint.order_id,
            "customer_name": customer_name,
        })

    return result


#Pregled pojedinacne reklamacije
@router.get("/complaints/{complaint_id}", response_model=ComplaintWithCustomer)
def get_complaint_by_id(
    complaint_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    complaint = session.exec(
        select(Complaint)
        .where(Complaint.id == complaint_id)
        .options(selectinload(Complaint.order).selectinload(Order.customer))
    ).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return {
        "id": complaint.id,
        "description": complaint.description,
        "status": complaint.status,
        "preferred_resolution": complaint.preferred_resolution,
        "final_resolution": complaint.final_resolution,
        "response_text": complaint.response_text,
        "created_at": complaint.created_at,
        "order_id": complaint.order_id,
        "assigned_to": complaint.assigned_to,
        "customer_name": complaint.order.customer.name if complaint.order and complaint.order.customer else "Unknown",
        "response_text": complaint.response_text 
    }


# PUT: Azuriranje reklamacije (status, opis)
@router.put("/complaints/{complaint_id}", response_model=complaint_schema.Complaint)
def update_complaint_status(
    complaint_id: int,
    complaint_data: complaint_schema.ComplaintUpdate,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    db_complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint_crud.update_complaint(session, complaint_id, complaint_data.dict(exclude_unset=True))
    session.refresh(db_complaint)
    return db_complaint

# ODGOVOR ZAPOSLENIKA NA REKLAMACIJU TJ COMPLAINT
@router.put("/complaints/{complaint_id}/respond", response_model=complaint_schema.Complaint)
def respond_to_complaint(
    complaint_id: int,
    response: complaint_schema.ComplaintResponse,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    db_complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    db_complaint.response_text = response.response_text
    session.commit()
    session.refresh(db_complaint)
    return db_complaint


# Dodjeljivanje complainta
@router.put("/complaints/{complaint_id}/assign", response_model=complaint_schema.Complaint, tags=["Support"])
def assign_complaint_to_self(
    complaint_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    if complaint.assigned_to is not None:
        raise HTTPException(status_code=400, detail="Complaint already assigned")

    complaint.assigned_to = current_user.id
    session.commit()
    session.refresh(complaint)
    return complaint
