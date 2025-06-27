from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Annotated

from app.models.models import Complaint, User
from app.schemas.complaint import ComplaintWithCustomer, ComplaintUpdate, ComplaintResponse, Complaint
from app.schemas.support import SupportProfileUpdate
from app.dependencies import get_db
from app.services.user_service import role_check
from app.services import complaint_service, user_service

router = APIRouter()
SessionDep = Annotated[Session, Depends(get_db)]


#Dashboard
@router.get("/")
def support_dashboard(current_user: User = Depends(role_check(["support"]))):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "profile_link": f"/support/profile/{current_user.id}"
    }

# Profil zaposlenika
@router.get("/profile/{user_id}")
def get_support_profile(
    user_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    return user_service.get_support_profile_service(session, user_id)


# Zaposlenik azurira profil
@router.put("/profile/{user_id}")
def update_support_profile(
    user_id: int,
    update_data: SupportProfileUpdate,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    return user_service.update_support_profile_service(session, user_id, update_data, current_user.id)



# ------------------------------------------------------------------------------------------------------------------------------------------------
# DIO ZA COMPLAINTS


#GET:Pregled svih reklamacija
@router.get("/complaints", response_model=List[ComplaintWithCustomer])
def get_all_complaints(
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
): 
    return complaint_service.list_complaints(session)


#Pregled pojedinacne reklamacije
@router.get("/complaints/{complaint_id}", response_model=ComplaintWithCustomer)
def get_complaint_by_id(
    complaint_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    return complaint_service.get_complaint(session, complaint_id)

# PUT: Azuriranje reklamacije (status, opis)
@router.put("/complaints/{complaint_id}", response_model=Complaint)
def update_complaint_status(
    complaint_id: int,
    complaint_data: ComplaintUpdate,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    return complaint_service.update_complaint_status(session, complaint_id, complaint_data)

# ODGOVOR ZAPOSLENIKA NA REKLAMACIJU TJ COMPLAINT
@router.put("/complaints/{complaint_id}/respond", response_model=Complaint)
def respond_to_complaint(
    complaint_id: int,
    response: ComplaintResponse,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    return complaint_service.respond_to_complaint_service(session, complaint_id, response)


# Dodjeljivanje complainta
@router.put("/complaints/{complaint_id}/assign", response_model=Complaint, tags=["Support"])
def assign_complaint_to_self(
    complaint_id: int,
    session: SessionDep,
    current_user: User = Depends(role_check(["support"]))
):
    return complaint_service.assign_to_self(session, complaint_id, current_user.id)
