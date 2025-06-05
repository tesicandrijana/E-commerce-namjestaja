from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from app.models.models import UserInquiry, User
from app.schemas.inquiry import UserInquiryCreate, UserInquiryRead, InquiryResponse
from app.dependencies import get_db
from app.services.user_service import get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/inquiries", response_model=dict, status_code=201)
def create_inquiry(inquiry: UserInquiryCreate, db: Session = Depends(get_db)):
    inquiry = UserInquiry(**inquiry.dict())
    db.add(inquiry)
    db.commit()
    return {"message": "Inquiry sent successfully."}

@router.get("/support/inquiries", response_model=list[UserInquiryRead])
def get_all_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # Uzmi trenutno prijavljenog korisnika
):
    # Dozvoli samo zaposlenicima
    if current_user.role != "support":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pristup dozvoljen samo zaposlenicima (support)."
        )

    # Vrati sve upite iz baze, najnoviji prvi
    inquiries = db.exec(
        select(UserInquiry).order_by(UserInquiry.created_at.desc())
    ).all()

    return inquiries


@router.post("/support/inquiries/{inquiry_id}/respond")
def respond_to_inquiry(
    inquiry_id: int,
    message: InquiryResponse,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Dozvoli samo zaposlenicima
    if current_user.role != "support":
        raise HTTPException(status_code=403, detail="Samo za zaposlenike.")

    # Nađi inquiry
    inquiry = db.exec(select(UserInquiry).where(UserInquiry.id == inquiry_id)).first()

    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry nije pronadjen.")

    # Provjeri da nije već odgovoreno
    if inquiry.response is not None:
        raise HTTPException(status_code=400, detail="Vec postoji odgovor za ovaj upit.")

    # Sačuvaj odgovor i vrijeme odgovora
    inquiry.response = message.response
    inquiry.responded_at = datetime.utcnow()
    db.add(inquiry)
    db.commit()

    # Simuliraj slanje maila
    print("------------ SLANJE MAILA -------------")
    print(f"To: {inquiry.email}")
    print(f"Subject: Response to your inquiry")
    print("Message:")
    print(message.response)
    print("--------------------------------------")

    return {"message": "Odgovor je uspješno poslan (simulirano)."}
