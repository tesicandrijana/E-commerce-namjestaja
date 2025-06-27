from fastapi import HTTPException
from sqlmodel import Session
from datetime import datetime
from app.models.models import UserInquiry
from app.repositories import inquiry_repository
from app.schemas.inquiry import UserInquiryCreate, InquiryResponse
from app.utils.email import send_email

#kreiraj novi upit
def create_inquiry_service(session: Session, inquiry_data: UserInquiryCreate):
    inquiry = UserInquiry(**inquiry_data.dict())
    inquiry_repository.create_inquiry(session, inquiry)
    return {"message": "Inquiry sent successfully."}

#dohvati sve upite i validiraj da je user zaposlenik
def get_all_inquiries_service(session: Session, current_user):
    if current_user.role != "support":
        raise HTTPException(status_code=403, detail="For employees only.")
    return inquiry_repository.get_all_inquiries(session)


# Odgovori na upit
def respond_to_inquiry_service(session: Session, inquiry_id: int, message: InquiryResponse, current_user):
    if current_user.role != "support":
        raise HTTPException(status_code=403, detail="For employees only.")

    inquiry = inquiry_repository.get_inquiry_by_id(session, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    if inquiry.response is not None:
        raise HTTPException(status_code=400, detail="Inquiry already has a response")

    inquiry.response = message.response
    inquiry.responded_at = datetime.utcnow()
    inquiry_repository.update_inquiry(session, inquiry)

    # sadrzaj mail-a
    subject = "Response to your inquiry"
    body = f"{message.response}\n\nKind regards,\n{current_user.name} from user support"
    try:
        send_email(to=inquiry.email, subject=subject, body=body)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Inquiry answered and email sent successfully."}
