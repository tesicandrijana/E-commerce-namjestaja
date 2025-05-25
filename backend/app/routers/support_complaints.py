from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated

from app.models.models import Complaint, User
from app.schemas import complaint as complaint_schema
from app.dependencies import get_db
from app.crud import complaint as complaint_crud
from app.schemas.complaint import ComplaintUpdate

router = APIRouter(
    tags=["Support - Complaints"]
)

SessionDep = Annotated[Session, Depends(get_db)]

# PRIVREMENO: "glumimo" da je korisnik zaposlenik (dok ne koristiš pravu autentifikaciju)
def fake_support_user():
    return User(
        id=999,
        name="Test Support",
        email="support@test.com",
        role="support",
        is_active=True
    )

# TODO: Zamijeniti fake_support_user sa pravom autentifikacijom


#GET:Pregled svih reklamacija
@router.get("/", response_model=List[complaint_schema.Complaint])
def get_all_complaints(
    session: SessionDep,
    offset: int = 0,
    limit: int = 100,
    current_user: User = Depends(fake_support_user)
):
    return complaint_crud.get_complaints(session, offset=offset, limit=limit)

#Pregled pojedinacne reklamacije
@router.get("/{complaint_id}", response_model=complaint_schema.Complaint)
def get_complaint_by_id(
    complaint_id: int,
    session: SessionDep,
    current_user: User = Depends(fake_support_user)
):
    complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint



# PUT: Azuriranje reklamacije (status, opis)
@router.put("/{complaint_id}", response_model=complaint_schema.Complaint)
def update_complaint_status(
    complaint_id: int,
    complaint_data: complaint_schema.ComplaintUpdate,
    session: SessionDep,
    current_user: User = Depends(fake_support_user)
):
    db_complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint_crud.update_complaint(session, complaint_id, complaint_data.dict(exclude_unset=True))
    session.refresh(db_complaint)
    return db_complaint

@router.put("/{complaint_id}/respond", response_model=complaint_schema.Complaint)
def respond_to_complaint(
    complaint_id: int,
    response: complaint_schema.ComplaintResponse,
    session: SessionDep,
    current_user: User = Depends(fake_support_user)
):
    db_complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not db_complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    db_complaint.response_text = response.response_text
    session.commit()
    session.refresh(db_complaint)
    return db_complaint
