from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.models.models import Complaint, Order

# strana zaposlenika
def get_all_complaints(session: Session):
    return session.exec(
        select(Complaint)
        .options(selectinload(Complaint.order).selectinload(Order.customer))
    ).all()

def get_complaint_by_id(session: Session, complaint_id: int):
    return session.exec(
        select(Complaint)
        .where(Complaint.id == complaint_id)
        .options(selectinload(Complaint.order).selectinload(Order.customer))
    ).first()

def update_complaint(session: Session, complaint: Complaint, updates: dict):
    for key, value in updates.items():
        setattr(complaint, key, value)
    session.add(complaint)
    session.commit()
    session.refresh(complaint)
    return complaint

def assign_complaint(session: Session, complaint: Complaint, user_id: int):
    complaint.assigned_to = user_id
    session.add(complaint)
    session.commit()
    session.refresh(complaint)
    return complaint

def respond_to_complaint(session: Session, complaint: Complaint, response_text: str):
    complaint.response_text = response_text
    session.add(complaint)
    session.commit()
    session.refresh(complaint)
    return complaint




# strana kupca
def create_complaint(session: Session, complaint_data):
    new_complaint = Complaint(**complaint_data.dict())
    session.add(new_complaint)
    session.commit()
    session.refresh(new_complaint)
    return new_complaint

def get_complaints_by_customer(session: Session, customer_id: int):
    stmt = select(Complaint).where(Complaint.order.has(customer_id=customer_id))
    return session.exec(stmt).all()

def get_complaint_by_id_customer(session: Session, complaint_id: int, customer_id: int):
    stmt = select(Complaint).where(
        Complaint.id == complaint_id,
        Complaint.order.has(customer_id=customer_id)
    )
    return session.exec(stmt).first()

def get_assigned_complaints_for_customer(session: Session, customer_id: int):
    stmt = select(Complaint).where(
        Complaint.order.has(customer_id=customer_id),
        Complaint.assigned_to.is_not(None)
    )
    return session.exec(stmt).all()