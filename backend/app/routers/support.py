from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated, Optional

from app.models.models import Complaint, User
from app.schemas import complaint as complaint_schema
# from app.crud.user import get_user_by_id
from app.dependencies import get_db  #get_support_user - ne treba
from app.services.user_service import role_check

from app.crud import complaint as complaint_crud
from app.schemas.complaint import ComplaintUpdate

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]

# # PRIVREMENO: "glumimo" da je korisnik zaposlenik (dok ne koristiš pravu autentifikaciju)
# def fake_support_user():

# TODO: Zamijeniti fake_support_user sa pravom autentifikacijom, uradjeno            -   DONE
# u dependencies - get_support_user...  ipak  ne treba! koristi role check iz user_service

#GET:Pregled svih reklamacija
@router.get("/complaints", response_model=List[complaint_schema.Complaint])
def get_all_complaints(
    session: SessionDep,
    offset: int = 0,
    limit: int = 100,
    complaint_type: Optional[str] = None,  #dodano
    current_user: User = Depends(role_check(["support"]))
): 
    query = session.query(Complaint)       #podrzi query parametar
    if complaint_type:
        query = query.filter(Complaint.complaint_type == complaint_type)
    return query.offset(offset).limit(limit).all()


#Pregled pojedinacne reklamacije
@router.get("/complaints/{complaint_id}", response_model=complaint_schema.Complaint)
def get_complaint_by_id(
    complaint_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    complaint = session.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint


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
