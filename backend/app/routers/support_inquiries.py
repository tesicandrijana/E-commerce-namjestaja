from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.dependencies import get_db
from app.services.user_service import get_current_user
from app.models.models import User
from app.schemas.inquiry import UserInquiryCreate, InquiryResponse, UserInquiryRead
from app.services import inquiry_service

router = APIRouter()

#kreiraj upit
@router.post("/inquiries", response_model=dict, status_code=201)
def create_inquiry(inquiry: UserInquiryCreate, session: Session = Depends(get_db)):
    return inquiry_service.create_inquiry_service(session, inquiry)

#dohvati upite
@router.get("/support/inquiries", response_model=list[UserInquiryRead])
def get_all_inquiries(session: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return inquiry_service.get_all_inquiries_service(session, current_user)

#odgovori na upit, samo zaposlenik
@router.post("/support/inquiries/{inquiry_id}/respond", response_model=dict)
def respond_to_inquiry(
    inquiry_id: int,
    message: InquiryResponse,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return inquiry_service.respond_to_inquiry_service(session, inquiry_id, message, current_user)
