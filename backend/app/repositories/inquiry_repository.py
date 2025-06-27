from sqlmodel import Session, select
from app.models.models import UserInquiry

#dodavanje upita u bazu
def create_inquiry(session: Session, inquiry: UserInquiry):
    session.add(inquiry)
    session.commit()
    session.refresh(inquiry)
    return inquiry

def get_all_inquiries(session: Session):
    return session.exec(select(UserInquiry).order_by(UserInquiry.created_at.desc())).all()

def get_inquiry_by_id(session: Session, inquiry_id: int):
    return session.exec(select(UserInquiry).where(UserInquiry.id == inquiry_id)).first()


def update_inquiry(session: Session, inquiry: UserInquiry):
    session.add(inquiry)
    session.commit()
    session.refresh(inquiry)
    return inquiry
